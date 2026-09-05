// SPDX-License-Identifier: MIT
/**
 * Root reducer and replay (architecture §2). `state = fold(reduce, initial, log)`.
 *
 * The reducer is a pure function of (context, state, action): no wall clock, no randomness,
 * no async, no I/O — enforced by the engine determinism lint rule and by the replay property
 * test. It never throws; a rejected action is a typed `Result` and is not appended to the log.
 */
import { isLearnerAction, type LearnerAction } from './actions.ts';
import { advanceClock, type EventEffect } from './clock.ts';
import type { HandlerContext, ReduceContext } from './context.ts';
import { ask } from './dialogue.ts';
import { fail, ok, type EngineError, type Result } from './errors.ts';
import { applyEscalationResponse, awaitEscalation, escalate } from './escalation.ts';
import { examineArtifact, openSource } from './sources.ts';
import type { SessionState } from './state.ts';
import {
  removeAdmissionAction,
  removeDiscrepancy,
  removeHistory,
  seedHistoryFromSource,
  setAdmissionAction,
  setDiscrepancy,
  setHistory,
} from './workspace.ts';

export interface ReduceOptions {
  /**
   * `sign` is applied only through the session seam (after `canSign`) and during replay of a
   * stored log; a direct `dispatch({type:'sign'})` is refused with `sign-via-seam`.
   */
  readonly allowSign?: boolean | undefined;
}

export function makeHandlerContext(ctx: ReduceContext): HandlerContext {
  const effect: EventEffect = (state, event) => {
    switch (event.kind) {
      case 'escalation-response':
        return applyEscalationResponse(ctx.index, state, event);
      case 'source-available':
      case 'escalation-retry-available':
      case 'escalation-window-opens':
        // Informational crossings: recorded on the timeline; availability is derived.
        return state;
    }
  };
  return { ...ctx, advance: (state, minutes) => advanceClock(state, minutes, effect) };
}

export function reduce(
  ctx: ReduceContext,
  state: SessionState,
  action: LearnerAction,
  options: ReduceOptions = {},
): Result<SessionState> {
  if (state.signedAtMinutes !== null)
    return fail('session-signed', 'the case has been signed; no further action is possible', {
      signedAtMinutes: state.signedAtMinutes,
    });
  const h = makeHandlerContext(ctx);
  let r: Result<SessionState>;
  switch (action.type) {
    case 'open-source':
      r = openSource(h, state, action.sourceId);
      break;
    case 'examine-artifact':
      r = examineArtifact(h, state, action.artifactId);
      break;
    case 'ask':
      r = ask(h, state, action.treeId, action.nodeId);
      break;
    case 'escalate':
      r = escalate(h, state, action.channelId);
      break;
    case 'await-escalation':
      r = awaitEscalation(h, state, action.channelId);
      break;
    case 'history/set':
      r = setHistory(h, state, action.entry);
      break;
    case 'history/remove':
      r = removeHistory(state, action.medKey);
      break;
    case 'history/seed-from-source':
      r = seedHistoryFromSource(h, state, action.sourceId);
      break;
    case 'discrepancy/set':
      r = setDiscrepancy(h, state, action.entry);
      break;
    case 'discrepancy/remove':
      r = removeDiscrepancy(state, action.entryId);
      break;
    case 'action-list/set':
      r = setAdmissionAction(h, state, action.entry);
      break;
    case 'action-list/remove':
      r = removeAdmissionAction(state, action.medKey);
      break;
    case 'sign':
      r =
        options.allowSign === true
          ? ok({ ...state, signedAtMinutes: state.clock.minutesSinceT0 })
          : fail('sign-via-seam', 'signature goes through session.sign() (D-WF-004)', {});
      break;
    default: {
      const t = (action as { type?: unknown }).type;
      r = fail('unknown-action', `unknown action type ${String(t)}`, { type: String(t) });
    }
  }
  if (!r.ok) return r;
  return ok({ ...r.value, appliedActions: r.value.appliedActions + 1 });
}

export interface ReplayResult {
  readonly state: SessionState;
  /** Number of log entries applied before stopping. */
  readonly applied: number;
  /** The first rejection, if any; the returned state is the state before it. */
  readonly failure: { readonly index: number; readonly error: EngineError } | null;
}

/** Folds a log (typed or untrusted) over the initial state; stops at the first rejection. */
export function replay(
  ctx: ReduceContext,
  initial: SessionState,
  log: readonly unknown[],
): ReplayResult {
  let state = initial;
  for (let i = 0; i < log.length; i++) {
    const entry = log[i];
    if (!isLearnerAction(entry)) {
      return {
        state,
        applied: i,
        failure: {
          index: i,
          error: {
            code: 'malformed-action',
            message: `log entry ${i} is not an action`,
            details: {},
          },
        },
      };
    }
    const r = reduce(ctx, state, entry, { allowSign: true });
    if (!r.ok) return { state, applied: i, failure: { index: i, error: r.error } };
    state = r.value;
  }
  return { state, applied: log.length, failure: null };
}
