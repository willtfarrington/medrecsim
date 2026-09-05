// SPDX-License-Identifier: MIT
/**
 * The learner action vocabulary — the only thing the engine ever records. The append-only log
 * of these actions is the single source of truth; every other structure is a fold over it
 * (architecture §2). No action carries free text (D-MED-004, INV-SCOPE-001): medications are
 * named by key, justifications by authored rationale-menu key, classifications by taxonomy
 * token.
 *
 * Two families matter for D-MED-002:
 * - **reconstruction** actions write the working medication history — the learner's picture
 *   of the pre-admission state;
 * - **admission** actions (`action-list/*`) record post-T0 decisions such as inpatient holds.
 * The reducer keeps the two artifacts structurally separate; an admission action can never
 * reach the history, and a reconstruction write stamped after T0 is rejected with a typed
 * error (`post-t0-mutation`).
 */
import type { ActionKind, ClaimStatus, DiscrepancyType, Mechanism } from '@medrecsim/schema/vocab';

/** `rx:<formularyId>` for formulary medications; `label:<text>` for sanctioned unresolved labels. */
export type MedKey = string;

export function medKeyOf(ref: {
  readonly formularyId?: string | undefined;
  readonly unresolvedLabel?: { readonly text: string } | undefined;
}): MedKey | null {
  if (ref.formularyId !== undefined) return `rx:${ref.formularyId}`;
  if (ref.unresolvedLabel !== undefined) return `label:${ref.unresolvedLabel.text}`;
  return null;
}

export const CONFIDENCE_LEVELS = ['verified', 'probable', 'unverified'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

/** One line of the working medication history (D-MED-004 artifact 1). */
export interface HistoryEntry {
  readonly medKey: MedKey;
  /** Pre-admission status in the D-MED-001 vocabulary. */
  readonly status: ClaimStatus;
  readonly confidence: Confidence;
  /** Evidence claims the learner cites for this line (must be visible to the learner). */
  readonly claimIds: readonly string[];
  /** Simulated minutes relative to T0 the line describes; never positive (D-MED-002). */
  readonly asOfMinutes: number;
}

export type DiscrepancyResolution =
  | { readonly kind: 'open' }
  | { readonly kind: 'resolved-with-rationale'; readonly rationaleKey: string }
  | { readonly kind: 'escalated'; readonly channelId: string };

export interface DiscrepancyClassification {
  readonly type: DiscrepancyType;
  readonly mechanism: Mechanism;
}

/** One line of the discrepancy log (D-MED-004 artifact 2). `entryId` is learner-side. */
export interface DiscrepancyEntry {
  readonly entryId: string;
  readonly medKey: MedKey;
  readonly classification: DiscrepancyClassification | null;
  readonly claimIds: readonly string[];
  readonly resolution: DiscrepancyResolution;
}

/** One line of the admission action list (D-MED-004 artifact 3): a post-T0 decision. */
export interface AdmissionActionEntry {
  readonly medKey: MedKey;
  readonly action: ActionKind;
  readonly rationaleKey: string;
  /** Simulated clock when the decision was recorded (always ≥ 0: admission time). */
  readonly recordedAtMinutes: number;
}

export type HistoryEntryInput = Omit<HistoryEntry, 'asOfMinutes'> & {
  readonly asOfMinutes?: number | undefined;
};
export type AdmissionActionInput = Omit<AdmissionActionEntry, 'recordedAtMinutes'>;

export type LearnerAction =
  | { readonly type: 'open-source'; readonly sourceId: string }
  | { readonly type: 'examine-artifact'; readonly artifactId: string }
  | { readonly type: 'ask'; readonly treeId: string; readonly nodeId: string }
  | { readonly type: 'escalate'; readonly channelId: string }
  | { readonly type: 'await-escalation'; readonly channelId: string }
  | { readonly type: 'history/set'; readonly entry: HistoryEntryInput }
  | { readonly type: 'history/remove'; readonly medKey: MedKey }
  /** OQ-6 bulk-cite: seed unverified history rows from every visible claim of one source. */
  | { readonly type: 'history/seed-from-source'; readonly sourceId: string }
  | { readonly type: 'discrepancy/set'; readonly entry: DiscrepancyEntry }
  | { readonly type: 'discrepancy/remove'; readonly entryId: string }
  | { readonly type: 'action-list/set'; readonly entry: AdmissionActionInput }
  | { readonly type: 'action-list/remove'; readonly medKey: MedKey }
  | { readonly type: 'sign' };

export type LearnerActionType = LearnerAction['type'];

export const LEARNER_ACTION_TYPES: readonly LearnerActionType[] = [
  'open-source',
  'examine-artifact',
  'ask',
  'escalate',
  'await-escalation',
  'history/set',
  'history/remove',
  'history/seed-from-source',
  'discrepancy/set',
  'discrepancy/remove',
  'action-list/set',
  'action-list/remove',
  'sign',
];

/** Actions that record post-T0 (admission-time) decisions — D-MED-002's "inpatient holds". */
export const ADMISSION_ACTION_TYPES: readonly LearnerActionType[] = [
  'action-list/set',
  'action-list/remove',
];

/** Actions that write the reconstructed pre-admission picture. */
export const RECONSTRUCTION_ACTION_TYPES: readonly LearnerActionType[] = [
  'history/set',
  'history/remove',
  'history/seed-from-source',
];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isStr(v: unknown): v is string {
  return typeof v === 'string' && v.length > 0;
}
function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

/**
 * Structural guard for actions arriving from outside the type system (a stored log). Field
 * *values* (ids, tokens, keys) are checked by the reducer against the case; this only checks
 * shape so a tampered envelope is discarded rather than crashing a replay.
 */
export function isLearnerAction(v: unknown): v is LearnerAction {
  if (!isRecord(v) || !isStr(v['type'])) return false;
  switch (v['type']) {
    case 'open-source':
    case 'history/seed-from-source':
      return isStr(v['sourceId']);
    case 'examine-artifact':
      return isStr(v['artifactId']);
    case 'ask':
      return isStr(v['treeId']) && isStr(v['nodeId']);
    case 'escalate':
    case 'await-escalation':
      return isStr(v['channelId']);
    case 'history/set': {
      const e = v['entry'];
      return (
        isRecord(e) &&
        isStr(e['medKey']) &&
        isStr(e['status']) &&
        isStr(e['confidence']) &&
        isStrArray(e['claimIds']) &&
        (e['asOfMinutes'] === undefined || typeof e['asOfMinutes'] === 'number')
      );
    }
    case 'history/remove':
    case 'action-list/remove':
      return isStr(v['medKey']);
    case 'discrepancy/set': {
      const e = v['entry'];
      if (!isRecord(e) || !isStr(e['entryId']) || !isStr(e['medKey'])) return false;
      if (!isStrArray(e['claimIds'])) return false;
      const c = e['classification'];
      if (!(c === null || (isRecord(c) && isStr(c['type']) && isStr(c['mechanism'])))) return false;
      const r = e['resolution'];
      if (!isRecord(r) || !isStr(r['kind'])) return false;
      if (r['kind'] === 'open') return true;
      if (r['kind'] === 'resolved-with-rationale') return isStr(r['rationaleKey']);
      if (r['kind'] === 'escalated') return isStr(r['channelId']);
      return false;
    }
    case 'discrepancy/remove':
      return isStr(v['entryId']);
    case 'action-list/set': {
      const e = v['entry'];
      return isRecord(e) && isStr(e['medKey']) && isStr(e['action']) && isStr(e['rationaleKey']);
    }
    case 'sign':
      return true;
    default:
      return false;
  }
}
