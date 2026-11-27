// SPDX-License-Identifier: MIT
/**
 * Session state — a pure fold over the action log (architecture §2). Everything here is
 * plain JSON data (arrays, not Maps or Sets) with a stable insertion order, so two folds of
 * the same log are structurally identical and a stable serializer hashes them identically.
 *
 * The state holds learner-side facts only: which sources were opened, which questions were
 * asked, which claims became visible and when, escalation attempts, the fired clock events,
 * the three workspace artifacts, and the hint grades asked for. It never holds the case content
 * itself; from the reference layer it holds only the opaque keys a learner action names
 * (rationale-menu keys, hint ids), never authored text or answers.
 */
import {
  medKeyOf,
  type AdmissionActionEntry,
  type DiscrepancyEntry,
  type HintTier,
  type HistoryEntry,
  type MedKey,
} from './actions.ts';
import type { EvidenceIndex, MedicationRef } from './evidence-index.ts';

/**
 * Bumped whenever the action vocabulary or the state shape changes (ADR-9): a stored session of
 * another version is discarded politely (I-4). 2 = EP-12a (`request-hint`, `hints`, the gate).
 */
export const ENGINE_STATE_VERSION = 2;

export interface SourceRecord {
  readonly sourceId: string;
  readonly openedAtMinutes: number;
}

export interface AskedRecord {
  readonly treeId: string;
  readonly nodeId: string;
  readonly atMinutes: number;
}

export interface ExaminedRecord {
  readonly artifactId: string;
  readonly atMinutes: number;
}

/** How a claim became visible — the "what-was-knowable-when" datum the debrief needs (D-PED-002). */
export type RevealVia =
  | { readonly kind: 'source-open'; readonly sourceId: string }
  | { readonly kind: 'dialogue-node'; readonly treeId: string; readonly nodeId: string }
  | { readonly kind: 'artifact'; readonly artifactId: string }
  | { readonly kind: 'escalation-response'; readonly channelId: string; readonly attempt: number };

export interface RevealRecord {
  readonly claimId: string;
  readonly atMinutes: number;
  readonly via: RevealVia;
}

export const ESCALATION_OUTCOMES = [
  'awaiting-response',
  'answered',
  'voicemail-left',
  'busy',
  'closed',
] as const;
export type EscalationOutcome = (typeof ESCALATION_OUTCOMES)[number];

export interface EscalationRecord {
  readonly channelId: string;
  /** 1-based attempt number on this channel. */
  readonly attempt: number;
  readonly initiatedAtMinutes: number;
  readonly outcome: EscalationOutcome;
  /** When the authored response arrives (awaiting-response, voicemail-left). */
  readonly respondsAtMinutes: number | null;
  readonly answeredAtMinutes: number | null;
  /** When a retry becomes sensible (busy). */
  readonly retryAfterMinutes: number | null;
  /** When the channel next opens (closed). */
  readonly nextOpensAtMinutes: number | null;
}

/**
 * Authored threshold events: scheduled when the fold learns of them, fired deterministically
 * in (atMinutes, seq) order the first time the clock crosses their instant.
 */
export type ScheduledEvent =
  | {
      readonly seq: number;
      readonly atMinutes: number;
      readonly kind: 'source-available';
      readonly sourceId: string;
    }
  | {
      readonly seq: number;
      readonly atMinutes: number;
      readonly kind: 'escalation-response';
      readonly channelId: string;
      readonly attempt: number;
    }
  | {
      readonly seq: number;
      readonly atMinutes: number;
      readonly kind: 'escalation-retry-available';
      readonly channelId: string;
      readonly attempt: number;
    }
  | {
      readonly seq: number;
      readonly atMinutes: number;
      readonly kind: 'escalation-window-opens';
      readonly channelId: string;
      readonly attempt: number;
    };

export type ScheduledEventKind = ScheduledEvent['kind'];

/** A scheduled event before it is given its sequence number (distributes over the union). */
export type UnsequencedEvent = ScheduledEvent extends infer E
  ? E extends ScheduledEvent
    ? Omit<E, 'seq'>
    : never
  : never;

export interface FiredEvent {
  readonly event: ScheduledEvent;
  /** The clock value the crossing happened at (≥ event.atMinutes). */
  readonly firedAtMinutes: number;
}

/**
 * One hint grade the learner asked for (D-PED-001): which authored hint (its id names the target
 * discrepancy in the reference layer), which grade, the simulated minute, and the log sequence —
 * the 0-based index of the `request-hint` action in the log, which orders hints against finds
 * that happen in the same simulated minute. Recorded only; never subtracted from any score.
 */
export interface HintRecord {
  readonly hintId: string;
  readonly tier: HintTier;
  readonly atMinutes: number;
  readonly seq: number;
}

export interface Workspace {
  readonly history: readonly HistoryEntry[];
  readonly discrepancyLog: readonly DiscrepancyEntry[];
  readonly actionList: readonly AdmissionActionEntry[];
}

export interface SessionState {
  readonly engineStateVersion: number;
  readonly caseId: string;
  readonly clock: { readonly minutesSinceT0: number };
  readonly sources: readonly SourceRecord[];
  readonly asked: readonly AskedRecord[];
  /** `${treeId}/${nodeId}` keys unlocked by earlier answers. */
  readonly unlocked: readonly string[];
  readonly examined: readonly ExaminedRecord[];
  readonly reveals: readonly RevealRecord[];
  readonly allergyReveals: readonly RevealRecord[];
  readonly escalations: readonly EscalationRecord[];
  readonly pending: readonly ScheduledEvent[];
  readonly timeline: readonly FiredEvent[];
  readonly nextSeq: number;
  readonly workspace: Workspace;
  readonly hints: readonly HintRecord[];
  readonly signedAtMinutes: number | null;
  /** Number of actions folded so far (equals the log length). */
  readonly appliedActions: number;
}

/** The state before any action: clock at T0, time-gated sources scheduled. */
export function initialState(index: EvidenceIndex): SessionState {
  const pending: ScheduledEvent[] = [];
  let seq = 0;
  for (const sourceId of index.sourceOrder) {
    const at = index.availableFromMinutes.get(sourceId);
    if (at !== undefined && at > 0) {
      pending.push({ seq: seq++, atMinutes: at, kind: 'source-available', sourceId });
    }
  }
  return {
    engineStateVersion: ENGINE_STATE_VERSION,
    caseId: index.caseId,
    clock: { minutesSinceT0: 0 },
    sources: [],
    asked: [],
    unlocked: [],
    examined: [],
    reveals: [],
    allergyReveals: [],
    escalations: [],
    pending,
    timeline: [],
    nextSeq: seq,
    workspace: { history: [], discrepancyLog: [], actionList: [] },
    hints: [],
    signedAtMinutes: null,
    appliedActions: 0,
  };
}

export function isSourceOpened(state: SessionState, sourceId: string): boolean {
  return state.sources.some((s) => s.sourceId === sourceId);
}

export function isClaimVisible(state: SessionState, claimId: string): boolean {
  return state.reveals.some((r) => r.claimId === claimId);
}

export function isAllergyClaimVisible(state: SessionState, allergyClaimId: string): boolean {
  return state.allergyReveals.some((r) => r.claimId === allergyClaimId);
}

/**
 * Medications the learner has seen: those named by at least one revealed claim, in the evidence
 * layer's first-appearance order. The universe of D-WF-004's "every medication carries a status"
 * and of the workspace view's medication list.
 */
export function visibleMedications(index: EvidenceIndex, state: SessionState): MedicationRef[] {
  const visible = new Set<MedKey>();
  for (const r of state.reveals) {
    const claim = index.claims.get(r.claimId);
    const key = claim === undefined ? null : medKeyOf(claim);
    if (key !== null) visible.add(key);
  }
  const out: MedicationRef[] = [];
  for (const [key, ref] of index.medications) if (visible.has(key)) out.push(ref);
  return out;
}

export function nodeKey(treeId: string, nodeId: string): string {
  return `${treeId}/${nodeId}`;
}
