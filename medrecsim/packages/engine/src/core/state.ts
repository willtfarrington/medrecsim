// SPDX-License-Identifier: MIT
/**
 * Session state — a pure fold over the action log (architecture §2). Everything here is
 * plain JSON data (arrays, not Maps or Sets) with a stable insertion order, so two folds of
 * the same log are structurally identical and a stable serializer hashes them identically.
 *
 * The state holds learner-side facts only: which sources were opened, which questions were
 * asked, which claims became visible and when, escalation attempts, the fired clock events,
 * and the three workspace artifacts. It never holds the case content itself and never holds
 * anything from the reference layer.
 */
import type { AdmissionActionEntry, DiscrepancyEntry, HistoryEntry } from './actions.ts';
import type { EvidenceIndex } from './evidence-index.ts';

export const ENGINE_STATE_VERSION = 1;

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

export function nodeKey(treeId: string, nodeId: string): string {
  return `${treeId}/${nodeId}`;
}
