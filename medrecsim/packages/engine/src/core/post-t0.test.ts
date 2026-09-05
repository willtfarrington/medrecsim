// SPDX-License-Identifier: MIT
/**
 * D-MED-002 — post-T0 actions can never overwrite reconstructed pre-admission state.
 * Unit: the typed error. Property: removing every admission action from any accepted log
 * leaves the working history byte-identical.
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { ADMISSION_ACTION_TYPES, type LearnerAction } from './actions.ts';
import { stableStringify } from './serialize.ts';
import { arbCandidateLog, driveSession, vocabularyOf } from '../test-support/arbitraries.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { createSession } from '../session.ts';
import { APP_VERSION, codeOf, newSession, openedSession, run } from '../test-support/session.ts';
import { buildEvidenceIndex } from './evidence-index.ts';

const ALPHA = 'rx:rx-placeholder-alpha';

describe('typed error: post-t0-mutation', () => {
  it('rejects a history line stamped after T0', () => {
    const s = openedSession();
    const r = s.dispatch({
      type: 'history/set',
      entry: {
        medKey: ALPHA,
        status: 'prescribed',
        confidence: 'unverified',
        claimIds: [],
        asOfMinutes: 5,
      },
    });
    expect(codeOf(r)).toBe('post-t0-mutation');
    if (!r.ok) expect(r.error.details).toEqual({ medKey: ALPHA, asOfMinutes: 5 });
    // The rejected action is not appended: only the two open-source actions are in the log.
    expect(s.getLog().map((a) => a.type)).toEqual(['open-source', 'open-source']);
  });

  it('accepts a history line stamped at or before T0', () => {
    const s = openedSession();
    run(s, {
      type: 'history/set',
      entry: {
        medKey: ALPHA,
        status: 'prescribed',
        confidence: 'unverified',
        claimIds: [],
        asOfMinutes: -60 * 24 * 180,
      },
    });
    expect(s.getState().workspace.history[0]?.asOfMinutes).toBe(-259_200);
  });

  it('rejects an admission decision smuggled into the history as a status', () => {
    const s = openedSession();
    const r = s.dispatch({
      type: 'history/set',
      entry: {
        medKey: ALPHA,
        status: 'hold' as unknown as 'prescribed',
        confidence: 'unverified',
        claimIds: [],
      },
    });
    expect(codeOf(r)).toBe('post-t0-mutation');
  });

  it('an inpatient hold never touches the working history (structural)', () => {
    const s = openedSession();
    run(s, {
      type: 'history/set',
      entry: {
        medKey: ALPHA,
        status: 'prescribed',
        confidence: 'probable',
        claimIds: ['clm-ehr-alpha'],
      },
    });
    const historyBefore = s.getState().workspace.history;
    run(s, {
      type: 'action-list/set',
      entry: { medKey: ALPHA, action: 'hold', rationaleKey: 'rat-patient-stopped' },
    });
    run(s, { type: 'action-list/remove', medKey: ALPHA });
    run(s, {
      type: 'action-list/set',
      entry: { medKey: ALPHA, action: 'continue', rationaleKey: 'rat-verified-two-sources' },
    });
    expect(s.getState().workspace.history).toBe(historyBefore);
    expect(s.getState().workspace.history[0]?.status).toBe('prescribed');
  });
});

describe('property: admission actions are invisible to the reconstruction', () => {
  it('replaying an accepted log without its admission actions yields the same history (≥ 300 logs)', () => {
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const vocab = vocabularyOf(
      index,
      compiled.reference.actionSets.rationaleMenu.map((m) => m.key),
    );
    let sawAdmission = 0;
    fc.assert(
      fc.property(arbCandidateLog(vocab), (candidates) => {
        const accepted = driveSession(newSession(compiled), candidates);
        const withoutAdmission = accepted.filter(
          (a: LearnerAction) => !ADMISSION_ACTION_TYPES.includes(a.type),
        );
        if (withoutAdmission.length !== accepted.length) sawAdmission++;
        const full = createSession({ case: compiled, appVersion: APP_VERSION, log: accepted });
        const stripped = createSession({
          case: compiled,
          appVersion: APP_VERSION,
          log: withoutAdmission,
        });
        expect(stableStringify(stripped.getState().workspace.history)).toBe(
          stableStringify(full.getState().workspace.history),
        );
        expect(stripped.getState().workspace.actionList).toEqual([]);
      }),
      { numRuns: 300 },
    );
    expect(sawAdmission).toBeGreaterThan(0);
  });
});
