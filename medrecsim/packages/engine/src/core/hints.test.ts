// SPDX-License-Identifier: MIT
/**
 * Hint recording (D-PED-001; EP-12a): graduated grades, once each, no simulated time, nothing
 * touched but the hint record — proven directly and by a property over generated logs.
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { isLearnerAction, type LearnerAction } from './actions.ts';
import { buildEvidenceIndex } from './evidence-index.ts';
import { shownTiers } from './hints.ts';
import { stableStringify } from './serialize.ts';
import type { SessionState } from './state.ts';
import { createSession, restoreSession } from '../session.ts';
import { arbCandidateLog, driveSession, vocabularyOf } from '../test-support/arbitraries.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { APP_VERSION, codeOf, newSession, run } from '../test-support/session.ts';

const hint = (hintId: string, tier: string): LearnerAction =>
  ({ type: 'request-hint', hintId, tier }) as LearnerAction;

/** The state without what a hint request may change: the hint record and the action count. */
function withoutHints(state: SessionState): Omit<SessionState, 'hints' | 'appliedActions'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hints, appliedActions, ...rest } = state;
  return rest;
}

describe('request-hint', () => {
  it('records each grade in its graduated order, at the current minute, with its log sequence', () => {
    const s = newSession();
    run(
      s,
      { type: 'open-source', sourceId: 'src-ehr-list' },
      hint('hint-alpha', 'nudge'),
      hint('hint-alpha', 'directed'),
      { type: 'open-source', sourceId: 'src-interview' },
      hint('hint-alpha', 'reveal-source'),
    );
    expect(s.getState().hints).toEqual([
      { hintId: 'hint-alpha', tier: 'nudge', atMinutes: 1, seq: 1 },
      { hintId: 'hint-alpha', tier: 'directed', atMinutes: 1, seq: 2 },
      { hintId: 'hint-alpha', tier: 'reveal-source', atMinutes: 1, seq: 4 },
    ]);
    expect(shownTiers(s.getState(), 'hint-alpha')).toEqual(['nudge', 'directed', 'reveal-source']);
    expect(s.getState().clock.minutesSinceT0).toBe(1); // interview costs 0, hints cost 0
  });

  it('refuses a grade out of order, naming the grade that comes next', () => {
    const s = newSession();
    const r = s.dispatch(hint('hint-alpha', 'directed'));
    expect(codeOf(r)).toBe('hint-tier-out-of-order');
    expect(r.ok ? null : r.error.details['expected']).toBe('nudge');
    run(s, hint('hint-alpha', 'nudge'));
    const r2 = s.dispatch(hint('hint-alpha', 'reveal-source'));
    expect(codeOf(r2)).toBe('hint-tier-out-of-order');
    expect(r2.ok ? null : r2.error.details['expected']).toBe('directed');
  });

  it('refuses a grade already shown', () => {
    const s = newSession();
    run(s, hint('hint-beta', 'nudge'));
    expect(codeOf(s.dispatch(hint('hint-beta', 'nudge')))).toBe('hint-already-shown');
    run(s, hint('hint-beta', 'directed'), hint('hint-beta', 'reveal-source'));
    expect(codeOf(s.dispatch(hint('hint-beta', 'reveal-source')))).toBe('hint-already-shown');
  });

  it('refuses unknown hint ids and unknown grades', () => {
    const s = newSession();
    expect(codeOf(s.dispatch(hint('hint-bogus', 'nudge')))).toBe('unknown-hint');
    expect(codeOf(s.dispatch(hint('hint-alpha', 'bogus')))).toBe('invalid-entry');
    expect(s.getLog()).toEqual([]);
  });

  it('keeps each hint on its own ladder', () => {
    const s = newSession();
    run(s, hint('hint-alpha', 'nudge'), hint('hint-beta', 'nudge'), hint('hint-alpha', 'directed'));
    expect(shownTiers(s.getState(), 'hint-alpha')).toEqual(['nudge', 'directed']);
    expect(shownTiers(s.getState(), 'hint-beta')).toEqual(['nudge']);
  });

  it('touches nothing but the hint record: clock, reveals, timeline, workspace and view unchanged', () => {
    const s = newSession();
    run(s, { type: 'open-source', sourceId: 'src-ehr-list' });
    const before = s.getState();
    const viewBefore = s.getView();
    run(s, hint('hint-alpha', 'nudge'));
    expect(withoutHints(s.getState())).toEqual(withoutHints(before));
    // The learner's view carries no hint text yet (the projection is EP-25's).
    const { appliedActions: a1, ...v1 } = viewBefore;
    const { appliedActions: a2, ...v2 } = s.getView();
    expect(v2).toEqual(v1);
    expect(a2).toBe(a1 + 1);
    expect(JSON.stringify(s.getView())).not.toContain('hint-alpha');
  });

  it('is refused after signature', () => {
    const s = newSession();
    expect(codeOf(s.sign())).toBe('ok');
    expect(codeOf(s.dispatch(hint('hint-alpha', 'nudge')))).toBe('session-signed');
  });

  it('round-trips through the persistence envelope', () => {
    const s = newSession();
    run(s, hint('hint-alpha', 'nudge'), hint('hint-beta', 'nudge'));
    const r = restoreSession({
      case: exemplarCase(),
      appVersion: APP_VERSION,
      envelope: s.serialize(),
    });
    expect(r.kind).toBe('restored');
    if (r.kind === 'restored') expect(r.session.getState().hints).toEqual(s.getState().hints);
  });

  it('has a shape guard for stored logs', () => {
    expect(isLearnerAction({ type: 'request-hint', hintId: 'hint-alpha', tier: 'nudge' })).toBe(
      true,
    );
    expect(isLearnerAction({ type: 'request-hint', hintId: 'hint-alpha' })).toBe(false);
    expect(isLearnerAction({ type: 'request-hint', hintId: '', tier: 'nudge' })).toBe(false);
  });
});

describe('property: hint requests change nothing but the hint record (300 logs)', () => {
  it('stripping every request-hint from an accepted log leaves the rest of the state identical', () => {
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const vocab = vocabularyOf(
      index,
      compiled.reference.actionSets.rationaleMenu.map((m) => m.key),
      compiled.reference.hints.map((h) => h.id),
    );
    let sawHint = 0;
    fc.assert(
      fc.property(arbCandidateLog(vocab), (candidates) => {
        const accepted = driveSession(newSession(compiled), candidates);
        const stripped = accepted.filter((a) => a.type !== 'request-hint');
        if (stripped.length !== accepted.length) sawHint++;
        const full = createSession({ case: compiled, appVersion: APP_VERSION, log: accepted });
        const bare = createSession({ case: compiled, appVersion: APP_VERSION, log: stripped });
        expect(stableStringify(withoutHints(bare.getState()))).toBe(
          stableStringify(withoutHints(full.getState())),
        );
        expect(bare.getState().hints).toEqual([]);
      }),
      { numRuns: 300 },
    );
    expect(sawHint).toBeGreaterThan(0);
  });
});
