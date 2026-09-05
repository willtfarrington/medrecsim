// SPDX-License-Identifier: MIT
/**
 * Clock semantics (D-WF-002): authored costs move time; authored thresholds fire on crossing,
 * once, in order; escalation windows and latencies are evaluated on the case-local clock.
 * The exemplar's T0 is Thursday 14:30 local (19:30Z at -05:00).
 */
import { describe, expect, it } from 'vitest';
import { channelWindowAt } from './clock.ts';
import { buildEvidenceIndex } from './evidence-index.ts';
import { reduce } from './reduce.ts';
import { initialState } from './state.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { codeOf, must, newSession, run } from '../test-support/session.ts';

const HOUR = 60;
const DAY = 24 * HOUR;

function fixture() {
  const compiled = exemplarCase();
  const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
  const ctx = { index, rationaleKeys: new Set<string>() };
  return { compiled, index, ctx };
}

function channel(index: ReturnType<typeof buildEvidenceIndex>, id: string) {
  const ch = index.channels.get(id);
  if (ch === undefined) throw new Error(`no channel ${id}`);
  return ch;
}

describe('availability windows on the case-local clock', () => {
  it('reads the pharmacy (09:00–18:00 daily) as open at T0 and closed 3.5 h later', () => {
    const { index } = fixture();
    const pharmacy = channel(index, 'esc-pharmacy');
    expect(channelWindowAt(index, pharmacy, 0)).toEqual({ open: true, nextOpensAtMinutes: null });
    // 18:00 local is T0 + 3 h 30 min; next opening is 09:00 the next day = T0 + 18 h 30 min.
    expect(channelWindowAt(index, pharmacy, 3 * HOUR + 30)).toEqual({
      open: false,
      nextOpensAtMinutes: 18 * HOUR + 30,
    });
    expect(channelWindowAt(index, pharmacy, 3 * HOUR + 29).open).toBe(true);
  });

  it('reads the office (08:00–17:00 Mon–Fri) as closed on the weekend until Monday 08:00', () => {
    const { index } = fixture();
    const office = channel(index, 'esc-pcp-office');
    expect(channelWindowAt(index, office, 0).open).toBe(true);
    // 17:30 local Thursday: closed; next opening Friday 08:00 = T0 + 17 h 30 min.
    expect(channelWindowAt(index, office, 3 * HOUR)).toEqual({
      open: false,
      nextOpensAtMinutes: 17 * HOUR + 30,
    });
    // Saturday 14:30 local: closed; next opening Monday 08:00 = T0 + 3 d 17 h 30 min.
    expect(channelWindowAt(index, office, 2 * DAY)).toEqual({
      open: false,
      nextOpensAtMinutes: 3 * DAY + 17 * HOUR + 30,
    });
    expect(channelWindowAt(index, channel(index, 'esc-senior'), 2 * DAY)).toEqual({
      open: true,
      nextOpensAtMinutes: null,
    });
  });

  it('would evaluate the same window wrongly on UTC — the compile-time offset matters', () => {
    const { compiled } = fixture();
    const utcIndex = buildEvidenceIndex(compiled.evidence, 0);
    // 19:30Z read as local: the pharmacy (closes 18:00) would look closed at T0.
    expect(channelWindowAt(utcIndex, channel(utcIndex, 'esc-pharmacy'), 0).open).toBe(false);
  });
});

describe('threshold events fire deterministically on crossing', () => {
  it('fires the pharmacy-history availability once, at the crossing action, then lets it open', () => {
    const s = newSession();
    // 0 → 1 → 4 → 7 → 12 → 22 → 24 → 27 minutes: still before +45.
    run(
      s,
      { type: 'open-source', sourceId: 'src-ehr-list' },
      { type: 'open-source', sourceId: 'src-discharge' },
      { type: 'open-source', sourceId: 'src-outpatient-note' },
      { type: 'open-source', sourceId: 'src-interview' },
      { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' },
      { type: 'open-source', sourceId: 'src-caregiver' },
      { type: 'open-source', sourceId: 'src-artifacts' },
      { type: 'examine-artifact', artifactId: 'art-bottle-beta' },
      { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' },
    );
    expect(s.getState().clock.minutesSinceT0).toBe(27);
    expect(s.getState().timeline).toEqual([]);
    expect(codeOf(s.dispatch({ type: 'open-source', sourceId: 'src-pharmacy' }))).toBe(
      'source-not-yet-available',
    );
    // Senior (always open, latency 10): 27 → 37. Inpatient pharmacist (latency 15): 37 → 52.
    run(
      s,
      { type: 'escalate', channelId: 'esc-senior' },
      { type: 'await-escalation', channelId: 'esc-senior' },
      { type: 'escalate', channelId: 'esc-inpatient-pharmacist' },
    );
    expect(s.getState().clock.minutesSinceT0).toBe(37);
    run(s, { type: 'await-escalation', channelId: 'esc-inpatient-pharmacist' });
    const st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(52);
    expect(st.timeline.map((f) => [f.event.kind, f.event.atMinutes, f.firedAtMinutes])).toEqual([
      ['escalation-response', 37, 37],
      ['source-available', 45, 52],
      ['escalation-response', 52, 52],
    ]);
    expect(st.pending).toEqual([]);
    run(s, { type: 'open-source', sourceId: 'src-pharmacy' });
    expect(s.getState().clock.minutesSinceT0).toBe(57);
    expect(s.getState().timeline).toHaveLength(3);
  });

  it('answers an in-window escalation after its authored latency and reveals its content', () => {
    const s = newSession();
    run(s, { type: 'escalate', channelId: 'esc-pharmacy' });
    let st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(0);
    expect(st.escalations).toEqual([
      {
        channelId: 'esc-pharmacy',
        attempt: 1,
        initiatedAtMinutes: 0,
        outcome: 'awaiting-response',
        respondsAtMinutes: 20,
        answeredAtMinutes: null,
        retryAfterMinutes: null,
        nextOpensAtMinutes: null,
      },
    ]);
    expect(codeOf(s.dispatch({ type: 'escalate', channelId: 'esc-pharmacy' }))).toBe(
      'escalation-already-pending',
    );
    expect(codeOf(s.dispatch({ type: 'await-escalation', channelId: 'esc-senior' }))).toBe(
      'no-pending-escalation',
    );
    expect(codeOf(s.dispatch({ type: 'escalate', channelId: 'esc-nope' }))).toBe(
      'unknown-escalation-channel',
    );
    run(s, { type: 'await-escalation', channelId: 'esc-pharmacy' });
    st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(20);
    expect(st.escalations[0]?.outcome).toBe('answered');
    expect(st.escalations[0]?.answeredAtMinutes).toBe(20);
    // A second attempt is allowed once the first is answered.
    run(s, { type: 'escalate', channelId: 'esc-pharmacy' });
    expect(s.getState().escalations[1]?.attempt).toBe(2);
  });

  it('reveals escalation-response claims at the arrival instant', () => {
    const compiled = exemplarCase();
    const office = compiled.evidence.escalationChannels.find((c) => c.id === 'esc-pcp-office');
    if (office === undefined) throw new Error('fixture');
    office.responseContent.revealsClaimIds = ['clm-interview-alpha'];
    const s = newSession(compiled);
    run(s, { type: 'escalate', channelId: 'esc-pcp-office' });
    run(s, { type: 'open-source', sourceId: 'src-ehr-list' }); // 1 min: not yet
    expect(s.getState().reveals.map((r) => r.claimId)).toEqual(['clm-ehr-alpha']);
    run(s, { type: 'await-escalation', channelId: 'esc-pcp-office' }); // → 45
    expect(s.getState().reveals[1]).toEqual({
      claimId: 'clm-interview-alpha',
      atMinutes: 45,
      via: { kind: 'escalation-response', channelId: 'esc-pcp-office', attempt: 1 },
    });
  });
});

describe('unanswered behaviours outside the window', () => {
  it('voicemail-callback: the office calls back after the callback latency', () => {
    const { ctx, index } = fixture();
    const state = { ...initialState(index), clock: { minutesSinceT0: 3 * HOUR } }; // 17:30 local
    const s = must(reduce(ctx, state, { type: 'escalate', channelId: 'esc-pcp-office' }));
    expect(s.escalations[0]).toMatchObject({
      outcome: 'voicemail-left',
      respondsAtMinutes: 3 * HOUR + 90,
    });
    // The state was built at 17:30 directly, so the +45 source threshold was already crossed:
    // the zero-minute advance inside `escalate` fires it, leaving only the callback pending.
    expect(s.timeline.map((f) => [f.event.kind, f.event.atMinutes])).toEqual([
      ['source-available', 45],
    ]);
    expect(s.pending.map((e) => [e.kind, e.atMinutes])).toEqual([
      ['escalation-response', 3 * HOUR + 90],
    ]);
    const answered = must(
      reduce(ctx, s, { type: 'await-escalation', channelId: 'esc-pcp-office' }),
    );
    expect(answered.clock.minutesSinceT0).toBe(3 * HOUR + 90);
    expect(answered.escalations[0]?.outcome).toBe('answered');
  });

  it('closed-until-window: the call is logged as closed with the next opening scheduled', () => {
    const { ctx, index } = fixture();
    const state = { ...initialState(index), clock: { minutesSinceT0: 4 * HOUR } }; // 18:30 local
    const s = must(reduce(ctx, state, { type: 'escalate', channelId: 'esc-pharmacy' }));
    expect(s.escalations[0]).toMatchObject({
      outcome: 'closed',
      nextOpensAtMinutes: 18 * HOUR + 30,
    });
    expect(s.pending.at(-1)).toMatchObject({
      kind: 'escalation-window-opens',
      atMinutes: 18 * HOUR + 30,
    });
    expect(codeOf(reduce(ctx, s, { type: 'await-escalation', channelId: 'esc-pharmacy' }))).toBe(
      'no-pending-escalation',
    );
  });

  it('retry-later: the channel reports busy and schedules the retry threshold', () => {
    const { compiled } = fixture();
    const pharmacist = compiled.evidence.escalationChannels.find(
      (c) => c.id === 'esc-inpatient-pharmacist',
    );
    if (pharmacist === undefined) throw new Error('fixture');
    (pharmacist as { availabilityWindow: unknown }).availabilityWindow = {
      kind: 'hours',
      opens: '08:00',
      closes: '09:00',
    };
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const ctx = { index, rationaleKeys: new Set<string>() };
    const s = must(
      reduce(ctx, initialState(index), { type: 'escalate', channelId: 'esc-inpatient-pharmacist' }),
    );
    expect(s.escalations[0]).toMatchObject({ outcome: 'busy', retryAfterMinutes: 30 });
    expect(s.pending.map((e) => [e.kind, e.atMinutes])).toEqual([
      ['escalation-retry-available', 30],
      ['source-available', 45],
    ]);
  });

  it('fires a zero-latency response within the escalate action itself', () => {
    const { compiled } = fixture();
    const senior = compiled.evidence.escalationChannels.find((c) => c.id === 'esc-senior');
    if (senior === undefined) throw new Error('fixture');
    senior.latencyMinutes = 0;
    const s = newSession(compiled);
    run(s, { type: 'escalate', channelId: 'esc-senior' });
    expect(s.getState().escalations[0]?.outcome).toBe('answered');
    expect(s.getState().timeline).toHaveLength(1);
  });
});
