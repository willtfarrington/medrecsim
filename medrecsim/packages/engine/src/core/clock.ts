// SPDX-License-Identifier: MIT
/**
 * The simulated case clock (D-WF-002). Time moves only when an action spends an authored
 * cost; there is no real-time pressure anywhere. Authored threshold events (a time-gated
 * source becoming available, an escalation response arriving, a channel opening) are
 * scheduled as the fold learns of them and fire deterministically, in (atMinutes, seq) order,
 * the first time the clock crosses their instant. The same log therefore fires the same
 * events at the same clock values on every replay.
 */
import type { EscalationChannelDef } from '@medrecsim/schema/evidence';
import type { EvidenceIndex } from './evidence-index.ts';
import type { FiredEvent, ScheduledEvent, SessionState, UnsequencedEvent } from './state.ts';
import {
  MINUTE_MS,
  WEEKDAY_TOKENS,
  epochMsOfLocal,
  formatEpochMsAsIso,
  localClockOf,
  minutesBetween,
  parseClockTime,
  weekdayOfDayIndex,
} from './time.ts';

export function epochMsAt(index: EvidenceIndex, minutesSinceT0: number): number {
  return index.t0EpochMs + minutesSinceT0 * MINUTE_MS;
}

export function isoAt(index: EvidenceIndex, minutesSinceT0: number): string {
  return formatEpochMsAsIso(epochMsAt(index, minutesSinceT0));
}

export interface WindowStatus {
  readonly open: boolean;
  /** Next opening as simulated minutes since T0; null when open now, always open, or never opening within a week. */
  readonly nextOpensAtMinutes: number | null;
}

/** Evaluates an escalation channel's authored availability window at a simulated instant. */
export function channelWindowAt(
  index: EvidenceIndex,
  channel: EscalationChannelDef,
  minutesSinceT0: number,
): WindowStatus {
  const w = channel.availabilityWindow;
  if (w.kind === 'always') return { open: true, nextOpensAtMinutes: null };
  const opens = parseClockTime(w.opens);
  const closes = parseClockTime(w.closes);
  if (opens === null || closes === null || opens === closes) {
    return { open: false, nextOpensAtMinutes: null };
  }
  const days: ReadonlySet<string> = new Set(w.days ?? WEEKDAY_TOKENS);
  const offset = index.localUtcOffsetMinutes;
  const nowMs = epochMsAt(index, minutesSinceT0);
  const local = localClockOf(nowMs, offset);

  const openOn = (dayIndex: number, minuteOfDay: number): boolean => {
    if (opens < closes) {
      return days.has(weekdayOfDayIndex(dayIndex)) && minuteOfDay >= opens && minuteOfDay < closes;
    }
    // Overnight window: the part after `opens` belongs to this day, the part before `closes`
    // to the previous day's window.
    if (minuteOfDay >= opens) return days.has(weekdayOfDayIndex(dayIndex));
    if (minuteOfDay < closes) return days.has(weekdayOfDayIndex(dayIndex - 1));
    return false;
  };

  if (openOn(local.dayIndex, local.minuteOfDay)) return { open: true, nextOpensAtMinutes: null };
  for (let d = 0; d <= 7; d++) {
    const dayIndex = local.dayIndex + d;
    if (!days.has(weekdayOfDayIndex(dayIndex))) continue;
    const candidateMs = epochMsOfLocal(dayIndex, opens, offset);
    if (candidateMs > nowMs) {
      return { open: false, nextOpensAtMinutes: minutesBetween(index.t0EpochMs, candidateMs) };
    }
  }
  return { open: false, nextOpensAtMinutes: null };
}

function compareEvents(a: ScheduledEvent, b: ScheduledEvent): number {
  return a.atMinutes - b.atMinutes || a.seq - b.seq;
}

/** Adds a threshold event to the pending queue, keeping (atMinutes, seq) order. */
export function schedule(state: SessionState, event: UnsequencedEvent): SessionState {
  const withSeq = { ...event, seq: state.nextSeq } as ScheduledEvent;
  const pending = [...state.pending, withSeq].sort(compareEvents);
  return { ...state, pending, nextSeq: state.nextSeq + 1 };
}

export type EventEffect = (state: SessionState, event: ScheduledEvent) => SessionState;

/**
 * Advances the clock by an authored number of minutes, firing every pending event whose
 * instant is crossed (or already passed), in order, and applying its effect. Zero-minute
 * advances still fire events due now.
 */
export function advanceClock(
  state: SessionState,
  minutes: number,
  applyEffect: EventEffect,
): SessionState {
  const target = state.clock.minutesSinceT0 + Math.max(0, minutes);
  let s = state;
  for (;;) {
    const next = s.pending[0];
    if (next === undefined || next.atMinutes > target) break;
    const fired: FiredEvent = { event: next, firedAtMinutes: target };
    s = { ...s, pending: s.pending.slice(1), timeline: [...s.timeline, fired] };
    s = applyEffect(s, next);
  }
  return { ...s, clock: { minutesSinceT0: target } };
}
