// SPDX-License-Identifier: MIT
/**
 * The three linked learner artifacts (D-MED-004): working medication history, discrepancy log,
 * admission action list. No free text anywhere — medications by key, claims by visible id,
 * justifications by authored rationale key, classifications by taxonomy token.
 *
 * D-MED-002 fence. The history is the reconstructed pre-admission state; the action list is
 * where post-T0 decisions (inpatient holds, continues, escalations) live. The two are separate
 * arrays written by separate handlers: no admission handler touches `workspace.history`, and
 * a history write that is stamped after T0 or that carries an admission decision as a status
 * is rejected with the typed error `post-t0-mutation`. A property test replays random logs
 * with every admission action removed and checks the history is byte-identical.
 */
import {
  ACTION_KINDS,
  CLAIM_STATUSES,
  DISCREPANCY_TYPES,
  MECHANISMS,
  type ActionKind,
  type ClaimStatus,
  type DiscrepancyType,
  type Mechanism,
} from '@medrecsim/schema/vocab';
import {
  CONFIDENCE_LEVELS,
  medKeyOf,
  type AdmissionActionInput,
  type Confidence,
  type DiscrepancyEntry,
  type HistoryEntry,
  type HistoryEntryInput,
  type MedKey,
} from './actions.ts';
import type { HandlerContext } from './context.ts';
import { fail, ok, type EngineError, type Result } from './errors.ts';
import { isClaimVisible, isSourceOpened, type SessionState } from './state.ts';

const ENTRY_ID_RE = /^[a-z0-9][a-z0-9-]*$/;

function includes<T extends string>(list: readonly T[], value: string): value is T {
  return (list as readonly string[]).includes(value);
}

function checkMedication(ctx: HandlerContext, medKey: MedKey): EngineError | null {
  if (!ctx.index.medications.has(medKey)) {
    return {
      code: 'unknown-medication',
      message: `no evidence names medication ${medKey}`,
      details: { medKey },
    };
  }
  return null;
}

function checkClaims(
  ctx: HandlerContext,
  state: SessionState,
  claimIds: readonly string[],
  medKey: MedKey | null,
): EngineError | null {
  for (const claimId of claimIds) {
    const claim = ctx.index.claims.get(claimId);
    if (claim === undefined || !isClaimVisible(state, claimId)) {
      return {
        code: 'claim-not-visible',
        message: `claim ${claimId} is not visible to the learner`,
        details: { claimId },
      };
    }
    if (medKey !== null && medKeyOf(claim) !== medKey) {
      return {
        code: 'invalid-entry',
        message: `claim ${claimId} is not about ${medKey}`,
        details: { claimId, medKey },
      };
    }
  }
  return null;
}

function checkRationale(ctx: HandlerContext, rationaleKey: string): EngineError | null {
  if (!ctx.rationaleKeys.has(rationaleKey)) {
    return {
      code: 'unknown-rationale',
      message: `no rationale-menu item ${rationaleKey}`,
      details: { rationaleKey },
    };
  }
  return null;
}

function upsert<T>(list: readonly T[], match: (item: T) => boolean, entry: T): T[] {
  const i = list.findIndex(match);
  if (i < 0) return [...list, entry];
  return [...list.slice(0, i), entry, ...list.slice(i + 1)];
}

/** The D-MED-002 guard for every write into the reconstructed pre-admission history. */
export function checkPreT0Write(entry: HistoryEntryInput): EngineError | null {
  const asOf = entry.asOfMinutes ?? 0;
  if (!Number.isInteger(asOf) || asOf > 0) {
    return {
      code: 'post-t0-mutation',
      message: `the working history describes the pre-admission state; a line stamped ${asOf} minutes after T0 cannot overwrite it (D-MED-002)`,
      details: { medKey: entry.medKey, asOfMinutes: asOf },
    };
  }
  if (includes(ACTION_KINDS, entry.status)) {
    return {
      code: 'post-t0-mutation',
      message: `"${entry.status}" is an admission decision; it belongs in the action list, never in the pre-admission history (D-MED-002)`,
      details: { medKey: entry.medKey, status: entry.status },
    };
  }
  return null;
}

export function setHistory(
  ctx: HandlerContext,
  state: SessionState,
  entry: HistoryEntryInput,
): Result<SessionState> {
  const fence = checkPreT0Write(entry);
  if (fence !== null) return { ok: false, error: fence };
  if (!includes(CLAIM_STATUSES, entry.status))
    return fail('invalid-entry', `unknown claim status "${entry.status}"`, {
      status: entry.status,
    });
  if (!includes(CONFIDENCE_LEVELS, entry.confidence))
    return fail('invalid-entry', `unknown confidence "${entry.confidence}"`, {
      confidence: entry.confidence,
    });
  const med = checkMedication(ctx, entry.medKey);
  if (med !== null) return { ok: false, error: med };
  const claims = checkClaims(ctx, state, entry.claimIds, entry.medKey);
  if (claims !== null) return { ok: false, error: claims };
  const line: HistoryEntry = {
    medKey: entry.medKey,
    status: entry.status as ClaimStatus,
    confidence: entry.confidence as Confidence,
    claimIds: [...entry.claimIds],
    asOfMinutes: entry.asOfMinutes ?? 0,
  };
  const history = upsert(state.workspace.history, (h) => h.medKey === line.medKey, line);
  return ok({ ...state, workspace: { ...state.workspace, history } });
}

export function removeHistory(state: SessionState, medKey: MedKey): Result<SessionState> {
  if (!state.workspace.history.some((h) => h.medKey === medKey))
    return fail('unknown-workspace-entry', `no history line for ${medKey}`, { medKey });
  const history = state.workspace.history.filter((h) => h.medKey !== medKey);
  return ok({ ...state, workspace: { ...state.workspace, history } });
}

/** OQ-6 bulk-cite: one unverified line per visible claim of the source; existing lines are kept. */
export function seedHistoryFromSource(
  ctx: HandlerContext,
  state: SessionState,
  sourceId: string,
): Result<SessionState> {
  if (!ctx.index.sources.has(sourceId))
    return fail('unknown-source', `no source ${sourceId}`, { sourceId });
  if (!isSourceOpened(state, sourceId))
    return fail('source-not-opened', `open ${sourceId} before seeding from it`, { sourceId });
  const history = [...state.workspace.history];
  for (const claimId of ctx.index.claimOrder) {
    const claim = ctx.index.claims.get(claimId);
    if (claim === undefined || claim.sourceId !== sourceId || !isClaimVisible(state, claimId))
      continue;
    const medKey = medKeyOf(claim);
    if (medKey === null || history.some((h) => h.medKey === medKey)) continue;
    history.push({
      medKey,
      status: claim.claimStatus,
      confidence: 'unverified',
      claimIds: [claimId],
      asOfMinutes: 0,
    });
  }
  return ok({ ...state, workspace: { ...state.workspace, history } });
}

export function setDiscrepancy(
  ctx: HandlerContext,
  state: SessionState,
  entry: DiscrepancyEntry,
): Result<SessionState> {
  if (!ENTRY_ID_RE.test(entry.entryId))
    return fail('invalid-entry', `entry id "${entry.entryId}" must be lowercase kebab-case`, {
      entryId: entry.entryId,
    });
  const med = checkMedication(ctx, entry.medKey);
  if (med !== null) return { ok: false, error: med };
  const claims = checkClaims(ctx, state, entry.claimIds, null);
  if (claims !== null) return { ok: false, error: claims };
  if (entry.classification !== null) {
    const { type, mechanism } = entry.classification;
    if (!includes(DISCREPANCY_TYPES, type))
      return fail('invalid-entry', `unknown discrepancy type "${type}"`, { type });
    if (!includes(MECHANISMS, mechanism))
      return fail('invalid-entry', `unknown mechanism "${mechanism}"`, { mechanism });
  }
  const r = entry.resolution;
  if (r.kind === 'resolved-with-rationale') {
    const rat = checkRationale(ctx, r.rationaleKey);
    if (rat !== null) return { ok: false, error: rat };
  } else if (r.kind === 'escalated') {
    if (!ctx.index.channels.has(r.channelId))
      return fail('unknown-escalation-channel', `no escalation channel ${r.channelId}`, {
        channelId: r.channelId,
      });
  } else if (r.kind !== 'open') {
    return fail('invalid-entry', 'unknown resolution kind', {});
  }
  const line: DiscrepancyEntry = {
    entryId: entry.entryId,
    medKey: entry.medKey,
    classification:
      entry.classification === null
        ? null
        : {
            type: entry.classification.type as DiscrepancyType,
            mechanism: entry.classification.mechanism as Mechanism,
          },
    claimIds: [...entry.claimIds],
    resolution: r,
  };
  const discrepancyLog = upsert(
    state.workspace.discrepancyLog,
    (d) => d.entryId === line.entryId,
    line,
  );
  return ok({ ...state, workspace: { ...state.workspace, discrepancyLog } });
}

export function removeDiscrepancy(state: SessionState, entryId: string): Result<SessionState> {
  if (!state.workspace.discrepancyLog.some((d) => d.entryId === entryId))
    return fail('unknown-workspace-entry', `no discrepancy entry ${entryId}`, { entryId });
  const discrepancyLog = state.workspace.discrepancyLog.filter((d) => d.entryId !== entryId);
  return ok({ ...state, workspace: { ...state.workspace, discrepancyLog } });
}

/** Records a post-T0 decision. Structurally cannot reach `workspace.history` (D-MED-002). */
export function setAdmissionAction(
  ctx: HandlerContext,
  state: SessionState,
  entry: AdmissionActionInput,
): Result<SessionState> {
  const med = checkMedication(ctx, entry.medKey);
  if (med !== null) return { ok: false, error: med };
  if (!includes(ACTION_KINDS, entry.action))
    return fail('invalid-entry', `unknown action kind "${entry.action}"`, {
      action: entry.action,
    });
  const rat = checkRationale(ctx, entry.rationaleKey);
  if (rat !== null) return { ok: false, error: rat };
  const line = {
    medKey: entry.medKey,
    action: entry.action as ActionKind,
    rationaleKey: entry.rationaleKey,
    recordedAtMinutes: state.clock.minutesSinceT0,
  };
  const actionList = upsert(state.workspace.actionList, (a) => a.medKey === line.medKey, line);
  return ok({ ...state, workspace: { ...state.workspace, actionList } });
}

export function removeAdmissionAction(state: SessionState, medKey: MedKey): Result<SessionState> {
  if (!state.workspace.actionList.some((a) => a.medKey === medKey))
    return fail('unknown-workspace-entry', `no action-list line for ${medKey}`, { medKey });
  const actionList = state.workspace.actionList.filter((a) => a.medKey !== medKey);
  return ok({ ...state, workspace: { ...state.workspace, actionList } });
}
