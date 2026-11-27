// SPDX-License-Identifier: MIT
/**
 * The API seam (architecture §2): `createSession(...)` → `{getState, getView, dispatch,
 * canSign, sign, getDebrief, serialize}` (plus `getLog` and `subscribe` for the app's store
 * wiring, ADR-5). The session owns the append-only action log; every successful dispatch
 * appends one action and the state is always `fold(reduce, initial, log)`.
 *
 * Two-layer contract at the seam (D-MED-005): the session holds the whole compiled case,
 * including the reference layer, but `getView()` is computed by a module that cannot name a
 * reference type. `canSign` and `sign` apply the D-WF-004 gate (EP-12a, `core/signature.ts`);
 * `getDebrief` stays a fail-closed stub until the subscores (EP-12b) and the debrief data
 * (EP-12c) land.
 */
import { SCHEMA_VERSION } from '@medrecsim/schema/version';
import type { LearnerAction } from './core/actions.ts';
import type { ReduceContext } from './core/context.ts';
import { fail, type Result } from './core/errors.ts';
import { buildEvidenceIndex } from './core/evidence-index.ts';
import { checkEnvelope, type EnvelopeMismatch, type SessionEnvelope } from './core/persistence.ts';
import { reduce, replay } from './core/reduce.ts';
import { ALREADY_SIGNED, checkSignature, type SignatureCheck } from './core/signature.ts';
import { ENGINE_STATE_VERSION, initialState, type SessionState } from './core/state.ts';
import { projectView, type LearnerMenus, type SessionView } from './core/view.ts';
import type { CompiledCase } from './case-loader.ts';

export type { SignatureBlock, SignatureBlockCode, SignatureCheck } from './core/signature.ts';

/** EP-12b/EP-12c replace this with subscores and debrief data; until then it says why not. */
export type DebriefResult = {
  readonly available: false;
  readonly reason: 'not-signed' | 'not-implemented';
  readonly message: string;
};

export interface Session {
  readonly caseId: string;
  getState(): SessionState;
  getView(): SessionView;
  getLog(): readonly LearnerAction[];
  dispatch(action: LearnerAction): Result<SessionState>;
  canSign(): SignatureCheck;
  sign(): Result<SessionState>;
  getDebrief(): DebriefResult;
  serialize(): SessionEnvelope;
  /** Notifies after every successful dispatch or signature; returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
}

export interface CreateSessionOptions {
  readonly case: CompiledCase;
  /** The running app's version; part of the persistence envelope. */
  readonly appVersion: string;
  /** A log to fold before the session starts (used by `restoreSession`). */
  readonly log?: readonly LearnerAction[] | undefined;
}

export function createSession(options: CreateSessionOptions): Session {
  const compiled = options.case;
  const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
  const menu = compiled.reference.actionSets.rationaleMenu;
  const ctx: ReduceContext = {
    index,
    rationaleKeys: new Set(menu.map((m) => m.key)),
    hintIds: new Set(compiled.reference.hints.map((h) => h.id)),
  };
  const menus: LearnerMenus = { rationaleMenu: menu.map((m) => ({ key: m.key, text: m.text })) };

  const log: LearnerAction[] = [];
  let state = initialState(index);
  if (options.log !== undefined) {
    const r = replay(ctx, state, options.log);
    if (r.failure !== null) {
      throw new Error(
        `createSession: log entry ${r.failure.index} rejected (${r.failure.error.code}): ${r.failure.error.message}`,
      );
    }
    state = r.state;
    log.push(...options.log);
  }

  let viewCache: { state: SessionState; view: SessionView } | null = null;
  const listeners = new Set<() => void>();
  const notify = () => {
    for (const l of listeners) l();
  };

  const canSign = (): SignatureCheck => checkSignature(index, state);

  return {
    caseId: index.caseId,
    getState: () => state,
    getView: () => {
      if (viewCache === null || viewCache.state !== state) {
        viewCache = { state, view: projectView(index, state, menus) };
      }
      return viewCache.view;
    },
    getLog: () => log.slice(),
    dispatch(action) {
      const r = reduce(ctx, state, action);
      if (!r.ok) return r;
      state = r.value;
      log.push(action);
      notify();
      return r;
    },
    canSign,
    sign() {
      if (state.signedAtMinutes !== null)
        return fail('session-signed', ALREADY_SIGNED.message, {
          signedAtMinutes: state.signedAtMinutes,
        });
      // The reducer applies the same gate (checkSignature) to every sign, replays included.
      const r = reduce(ctx, state, { type: 'sign' }, { allowSign: true });
      if (!r.ok) return r;
      state = r.value;
      log.push({ type: 'sign' });
      notify();
      return r;
    },
    getDebrief() {
      if (state.signedAtMinutes === null)
        return { available: false, reason: 'not-signed', message: 'the case is not signed' };
      return {
        available: false,
        reason: 'not-implemented',
        message: 'the subscores land at EP-12b and the debrief data at EP-12c',
      };
    },
    serialize: () => ({
      appVersion: options.appVersion,
      schemaVersion: SCHEMA_VERSION,
      caseId: index.caseId,
      caseContentVersion: compiled.case.contentVersion,
      engineStateVersion: ENGINE_STATE_VERSION,
      log: log.slice(),
    }),
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type RestoreResult =
  | { readonly kind: 'restored'; readonly session: Session }
  | {
      readonly kind: 'discarded';
      readonly reason: 'malformed' | 'mismatch' | 'corrupt-log';
      readonly mismatch: EnvelopeMismatch | null;
      readonly message: string;
    };

export interface RestoreSessionOptions {
  readonly case: CompiledCase;
  readonly appVersion: string;
  /** A stored envelope (untrusted: parsed JSON). */
  readonly envelope: unknown;
}

/**
 * Rebuilds a session from a stored envelope. Any envelope field that differs from the
 * running app + case — including a contentVersion bump (I-4) — or a log that no longer
 * replays cleanly, discards the stored session; the caller starts fresh.
 */
export function restoreSession(options: RestoreSessionOptions): RestoreResult {
  const compiled = options.case;
  const check = checkEnvelope(options.envelope, {
    appVersion: options.appVersion,
    schemaVersion: SCHEMA_VERSION,
    caseId: compiled.case.id,
    caseContentVersion: compiled.case.contentVersion,
    engineStateVersion: ENGINE_STATE_VERSION,
  });
  if (!check.ok) {
    if (check.reason === 'mismatch') {
      return {
        kind: 'discarded',
        reason: 'mismatch',
        mismatch: check.mismatch,
        message: `stored ${check.mismatch.field} differs from the running app; local session discarded`,
      };
    }
    return { kind: 'discarded', reason: 'malformed', mismatch: null, message: check.message };
  }
  try {
    const session = createSession({
      case: compiled,
      appVersion: options.appVersion,
      log: check.envelope.log,
    });
    return { kind: 'restored', session };
  } catch (e) {
    return {
      kind: 'discarded',
      reason: 'corrupt-log',
      mismatch: null,
      message: e instanceof Error ? e.message : String(e),
    };
  }
}
