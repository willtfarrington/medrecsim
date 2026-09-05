// SPDX-License-Identifier: MIT
/**
 * Escalation primitives (D-CLIN-002; OQ-3 labels) sufficient for C01. Initiating an
 * escalation costs no clock time itself; the authored latency is a threshold event that fires
 * when the clock crosses it, and `await-escalation` is the learner's way of spending exactly
 * that authored time. Outside the availability window the channel's authored
 * `unansweredBehavior` decides what happens. The full four-channel UX and latency-as-clock
 * refinements mature at EP-21.
 */
import { channelWindowAt, schedule } from './clock.ts';
import type { HandlerContext } from './context.ts';
import { reveal } from './context.ts';
import { fail, ok, type Result } from './errors.ts';
import type { EvidenceIndex } from './evidence-index.ts';
import type { EscalationRecord, ScheduledEvent, SessionState } from './state.ts';

export function pendingEscalation(
  state: SessionState,
  channelId: string,
): EscalationRecord | undefined {
  return state.escalations.find(
    (e) =>
      e.channelId === channelId &&
      (e.outcome === 'awaiting-response' || e.outcome === 'voicemail-left') &&
      e.answeredAtMinutes === null,
  );
}

export function escalate(
  ctx: HandlerContext,
  state: SessionState,
  channelId: string,
): Result<SessionState> {
  const channel = ctx.index.channels.get(channelId);
  if (channel === undefined)
    return fail('unknown-escalation-channel', `no escalation channel ${channelId}`, {
      channelId,
    });
  if (pendingEscalation(state, channelId) !== undefined)
    return fail('escalation-already-pending', `${channelId} has a response pending`, {
      channelId,
    });
  const now = state.clock.minutesSinceT0;
  const attempt = state.escalations.filter((e) => e.channelId === channelId).length + 1;
  const window = channelWindowAt(ctx.index, channel, now);
  const base = {
    channelId,
    attempt,
    initiatedAtMinutes: now,
    respondsAtMinutes: null,
    answeredAtMinutes: null,
    retryAfterMinutes: null,
    nextOpensAtMinutes: null,
  };
  let record: EscalationRecord;
  let s = state;
  if (window.open) {
    const respondsAt = now + channel.latencyMinutes;
    record = { ...base, outcome: 'awaiting-response', respondsAtMinutes: respondsAt };
    s = schedule(s, { atMinutes: respondsAt, kind: 'escalation-response', channelId, attempt });
  } else {
    const behaviour = channel.unansweredBehavior;
    switch (behaviour.kind) {
      case 'voicemail-callback': {
        const respondsAt = now + behaviour.callbackLatencyMinutes;
        record = { ...base, outcome: 'voicemail-left', respondsAtMinutes: respondsAt };
        s = schedule(s, {
          atMinutes: respondsAt,
          kind: 'escalation-response',
          channelId,
          attempt,
        });
        break;
      }
      case 'retry-later': {
        const retryAt = now + behaviour.retryAfterMinutes;
        record = { ...base, outcome: 'busy', retryAfterMinutes: retryAt };
        s = schedule(s, {
          atMinutes: retryAt,
          kind: 'escalation-retry-available',
          channelId,
          attempt,
        });
        break;
      }
      case 'closed-until-window': {
        record = { ...base, outcome: 'closed', nextOpensAtMinutes: window.nextOpensAtMinutes };
        if (window.nextOpensAtMinutes !== null) {
          s = schedule(s, {
            atMinutes: window.nextOpensAtMinutes,
            kind: 'escalation-window-opens',
            channelId,
            attempt,
          });
        }
        break;
      }
    }
  }
  s = { ...s, escalations: [...s.escalations, record] };
  // A zero-latency response is due now; a zero-minute advance fires it.
  return ok(ctx.advance(s, 0));
}

export function awaitEscalation(
  ctx: HandlerContext,
  state: SessionState,
  channelId: string,
): Result<SessionState> {
  if (!ctx.index.channels.has(channelId))
    return fail('unknown-escalation-channel', `no escalation channel ${channelId}`, {
      channelId,
    });
  const pending = pendingEscalation(state, channelId);
  if (pending === undefined || pending.respondsAtMinutes === null)
    return fail('no-pending-escalation', `nothing is pending on ${channelId}`, { channelId });
  const wait = Math.max(0, pending.respondsAtMinutes - state.clock.minutesSinceT0);
  return ok(ctx.advance(state, wait));
}

/** Effect of a fired `escalation-response`: the record is answered and its content revealed. */
export function applyEscalationResponse(
  index: EvidenceIndex,
  state: SessionState,
  event: Extract<ScheduledEvent, { kind: 'escalation-response' }>,
): SessionState {
  const channel = index.channels.get(event.channelId);
  const escalations = state.escalations.map((e) =>
    e.channelId === event.channelId && e.attempt === event.attempt
      ? { ...e, outcome: 'answered' as const, answeredAtMinutes: event.atMinutes }
      : e,
  );
  let s: SessionState = { ...state, escalations };
  if (channel !== undefined) {
    s = reveal(
      s,
      channel.responseContent.revealsClaimIds,
      channel.responseContent.revealsAllergyClaimIds,
      event.atMinutes,
      { kind: 'escalation-response', channelId: event.channelId, attempt: event.attempt },
    );
  }
  return s;
}
