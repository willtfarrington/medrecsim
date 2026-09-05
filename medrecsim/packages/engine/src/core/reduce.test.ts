// SPDX-License-Identifier: MIT
/**
 * Reducer semantics over the exemplar: sources, dialogue, artifacts, reveal wiring, the
 * workspace artifacts, and the lifecycle guards. Clock thresholds and escalation windows are
 * in clock.test.ts; the D-MED-002 fence in post-t0.test.ts.
 */
import { describe, expect, it } from 'vitest';
import type { LearnerAction } from './actions.ts';
import { reduce } from './reduce.ts';
import { buildEvidenceIndex } from './evidence-index.ts';
import { initialState } from './state.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { codeOf, must, newSession, openedSession, run } from '../test-support/session.ts';

describe('initial state', () => {
  it('starts at T0 with the time-gated pharmacy history scheduled at +45 minutes', () => {
    const s = newSession().getState();
    expect(s.clock.minutesSinceT0).toBe(0);
    expect(s.sources).toEqual([]);
    expect(s.pending).toEqual([
      { seq: 0, atMinutes: 45, kind: 'source-available', sourceId: 'src-pharmacy' },
    ]);
    expect(s.appliedActions).toBe(0);
    expect(s.signedAtMinutes).toBeNull();
  });
});

describe('open-source', () => {
  it('spends the authored access cost and reveals the with-source claims', () => {
    const s = newSession();
    run(s, { type: 'open-source', sourceId: 'src-ehr-list' });
    const st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(1);
    expect(st.sources).toEqual([{ sourceId: 'src-ehr-list', openedAtMinutes: 1 }]);
    expect(st.reveals).toEqual([
      {
        claimId: 'clm-ehr-alpha',
        atMinutes: 1,
        via: { kind: 'source-open', sourceId: 'src-ehr-list' },
      },
    ]);
    expect(st.allergyReveals.map((r) => r.claimId)).toEqual(['alg-ehr-nka']);
  });

  it('rejects unknown, repeated, and not-yet-available sources with typed errors', () => {
    const s = newSession();
    expect(codeOf(s.dispatch({ type: 'open-source', sourceId: 'src-nope' }))).toBe(
      'unknown-source',
    );
    run(s, { type: 'open-source', sourceId: 'src-ehr-list' });
    expect(codeOf(s.dispatch({ type: 'open-source', sourceId: 'src-ehr-list' }))).toBe(
      'source-already-opened',
    );
    const r = s.dispatch({ type: 'open-source', sourceId: 'src-pharmacy' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe('source-not-yet-available');
      expect(r.error.details).toEqual({
        sourceId: 'src-pharmacy',
        availableAtMinutes: 45,
        nowMinutes: 1,
      });
    }
    expect(s.getState().appliedActions).toBe(1);
  });

  it('does not reveal on-reveal claims of an opened source', () => {
    const s = newSession();
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    expect(s.getState().reveals).toEqual([]);
    // The interview allergy claim is wired to a dialogue node, so it is on-reveal too.
    expect(s.getState().allergyReveals).toEqual([]);
  });
});

describe('dialogue (D-SIM-001)', () => {
  it('requires the source to be open, respects unlocks, asks once, and reveals', () => {
    const s = newSession();
    expect(codeOf(s.dispatch({ type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' }))).toBe(
      'source-not-opened',
    );
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    expect(codeOf(s.dispatch({ type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' }))).toBe(
      'dialogue-node-locked',
    );
    expect(codeOf(s.dispatch({ type: 'ask', treeId: 'dlg-patient', nodeId: 'q-nope' }))).toBe(
      'unknown-dialogue-node',
    );
    run(s, { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' });
    let st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(5);
    expect(st.asked).toEqual([{ treeId: 'dlg-patient', nodeId: 'q-open', atMinutes: 5 }]);
    expect(st.unlocked).toEqual(['dlg-patient/q-stopped']);
    expect(st.reveals).toEqual([
      {
        claimId: 'clm-interview-beta',
        atMinutes: 5,
        via: { kind: 'dialogue-node', treeId: 'dlg-patient', nodeId: 'q-open' },
      },
    ]);
    expect(codeOf(s.dispatch({ type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' }))).toBe(
      'dialogue-node-already-asked',
    );
    run(s, { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' });
    st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(8);
    expect(st.reveals.map((r) => r.claimId)).toEqual([
      'clm-interview-beta',
      'clm-interview-alpha',
      'clm-interview-unresolved',
    ]);
    expect(st.allergyReveals.map((r) => r.claimId)).toEqual(['alg-interview-class']);
  });
});

describe('artifacts', () => {
  it('requires the source, spends the cost, reveals label claims, examines once', () => {
    const s = newSession();
    expect(codeOf(s.dispatch({ type: 'examine-artifact', artifactId: 'art-bottle-beta' }))).toBe(
      'source-not-opened',
    );
    expect(codeOf(s.dispatch({ type: 'examine-artifact', artifactId: 'art-nope' }))).toBe(
      'unknown-artifact',
    );
    run(s, { type: 'open-source', sourceId: 'src-artifacts' });
    // The bottle's label claim is with-source: revealed by opening, first reveal wins.
    expect(s.getState().reveals[0]?.via).toEqual({
      kind: 'source-open',
      sourceId: 'src-artifacts',
    });
    run(s, { type: 'examine-artifact', artifactId: 'art-bottle-beta' });
    const st = s.getState();
    expect(st.clock.minutesSinceT0).toBe(2);
    expect(st.examined).toEqual([{ artifactId: 'art-bottle-beta', atMinutes: 2 }]);
    expect(st.reveals).toHaveLength(1);
    expect(codeOf(s.dispatch({ type: 'examine-artifact', artifactId: 'art-bottle-beta' }))).toBe(
      'artifact-already-examined',
    );
  });

  it('reveals an on-reveal label claim through the artifact', () => {
    const compiled = exemplarCase();
    const claim = compiled.evidence.claims.find((c) => c.id === 'clm-artifact-beta');
    if (claim === undefined) throw new Error('fixture');
    (claim as { visibility: string }).visibility = 'on-reveal';
    const s = newSession(compiled);
    run(s, { type: 'open-source', sourceId: 'src-artifacts' });
    expect(s.getState().reveals).toEqual([]);
    run(s, { type: 'examine-artifact', artifactId: 'art-bottle-beta' });
    expect(s.getState().reveals).toEqual([
      {
        claimId: 'clm-artifact-beta',
        atMinutes: 2,
        via: { kind: 'artifact', artifactId: 'art-bottle-beta' },
      },
    ]);
  });
});

describe('workspace: working history (D-MED-004 artifact 1)', () => {
  it('accepts a line about a visible medication citing visible claims, and upserts', () => {
    const s = openedSession();
    const line = {
      medKey: 'rx:rx-placeholder-alpha',
      status: 'prescribed' as const,
      confidence: 'unverified' as const,
      claimIds: ['clm-ehr-alpha'],
    };
    run(s, { type: 'history/set', entry: line });
    expect(s.getState().workspace.history).toEqual([{ ...line, asOfMinutes: 0 }]);
    run(s, { type: 'history/set', entry: { ...line, confidence: 'verified' } });
    expect(s.getState().workspace.history).toEqual([
      { ...line, confidence: 'verified', asOfMinutes: 0 },
    ]);
    run(s, { type: 'history/remove', medKey: line.medKey });
    expect(s.getState().workspace.history).toEqual([]);
    expect(codeOf(s.dispatch({ type: 'history/remove', medKey: line.medKey }))).toBe(
      'unknown-workspace-entry',
    );
  });

  it('rejects unknown medications, invisible claims, claims about another medication, bad tokens', () => {
    const s = openedSession();
    const base = {
      medKey: 'rx:rx-placeholder-alpha',
      status: 'prescribed' as const,
      confidence: 'unverified' as const,
      claimIds: [] as string[],
    };
    expect(
      codeOf(s.dispatch({ type: 'history/set', entry: { ...base, medKey: 'rx:rx-nope' } })),
    ).toBe('unknown-medication');
    expect(
      codeOf(
        s.dispatch({ type: 'history/set', entry: { ...base, claimIds: ['clm-interview-alpha'] } }),
      ),
    ).toBe('claim-not-visible');
    run(s, { type: 'open-source', sourceId: 'src-artifacts' });
    expect(
      codeOf(
        s.dispatch({ type: 'history/set', entry: { ...base, claimIds: ['clm-artifact-beta'] } }),
      ),
    ).toBe('invalid-entry');
    expect(
      codeOf(
        s.dispatch({
          type: 'history/set',
          entry: { ...base, status: 'bogus' as unknown as 'prescribed' },
        }),
      ),
    ).toBe('invalid-entry');
    expect(
      codeOf(
        s.dispatch({
          type: 'history/set',
          entry: { ...base, confidence: 'bogus' as unknown as 'verified' },
        }),
      ),
    ).toBe('invalid-entry');
  });

  it('seeds unverified rows from a source without overwriting existing lines (OQ-6)', () => {
    const s = newSession();
    expect(codeOf(s.dispatch({ type: 'history/seed-from-source', sourceId: 'src-ehr-list' }))).toBe(
      'source-not-opened',
    );
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    run(s, { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' });
    run(s, { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' });
    run(s, {
      type: 'history/set',
      entry: {
        medKey: 'rx:rx-placeholder-beta',
        status: 'taking-as-directed',
        confidence: 'verified',
        claimIds: ['clm-interview-beta'],
      },
    });
    run(s, { type: 'history/seed-from-source', sourceId: 'src-interview' });
    expect(s.getState().workspace.history).toEqual([
      {
        medKey: 'rx:rx-placeholder-beta',
        status: 'taking-as-directed',
        confidence: 'verified',
        claimIds: ['clm-interview-beta'],
        asOfMinutes: 0,
      },
      {
        medKey: 'rx:rx-placeholder-alpha',
        status: 'self-discontinued',
        confidence: 'unverified',
        claimIds: ['clm-interview-alpha'],
        asOfMinutes: 0,
      },
      {
        medKey: 'label:PLACEHOLDER — a small white tablet the patient cannot name',
        status: 'taking-as-directed',
        confidence: 'unverified',
        claimIds: ['clm-interview-unresolved'],
        asOfMinutes: 0,
      },
    ]);
    // Idempotent.
    run(s, { type: 'history/seed-from-source', sourceId: 'src-interview' });
    expect(s.getState().workspace.history).toHaveLength(3);
  });
});

describe('workspace: discrepancy log and admission action list', () => {
  it('validates ids, keys, tokens, rationale keys and channels', () => {
    const s = openedSession();
    const entry = {
      entryId: 'dl-1',
      medKey: 'rx:rx-placeholder-alpha',
      classification: {
        type: 'commission' as const,
        mechanism: 'stale-record-propagation' as const,
      },
      claimIds: ['clm-ehr-alpha'],
      resolution: { kind: 'open' as const },
    };
    expect(
      codeOf(s.dispatch({ type: 'discrepancy/set', entry: { ...entry, entryId: 'Bad Id' } })),
    ).toBe('invalid-entry');
    expect(
      codeOf(
        s.dispatch({
          type: 'discrepancy/set',
          entry: {
            ...entry,
            resolution: { kind: 'resolved-with-rationale', rationaleKey: 'rat-nope' },
          },
        }),
      ),
    ).toBe('unknown-rationale');
    expect(
      codeOf(
        s.dispatch({
          type: 'discrepancy/set',
          entry: { ...entry, resolution: { kind: 'escalated', channelId: 'esc-nope' } },
        }),
      ),
    ).toBe('unknown-escalation-channel');
    expect(
      codeOf(
        s.dispatch({
          type: 'discrepancy/set',
          entry: {
            ...entry,
            classification: {
              type: 'bogus' as unknown as 'omission',
              mechanism: 'data-fragmentation',
            },
          },
        }),
      ),
    ).toBe('invalid-entry');
    run(s, { type: 'discrepancy/set', entry });
    run(s, {
      type: 'discrepancy/set',
      entry: {
        ...entry,
        resolution: { kind: 'resolved-with-rationale', rationaleKey: 'rat-patient-stopped' },
      },
    });
    expect(s.getState().workspace.discrepancyLog).toEqual([
      {
        ...entry,
        resolution: { kind: 'resolved-with-rationale', rationaleKey: 'rat-patient-stopped' },
      },
    ]);
    run(s, { type: 'discrepancy/remove', entryId: 'dl-1' });
    expect(s.getState().workspace.discrepancyLog).toEqual([]);
    expect(codeOf(s.dispatch({ type: 'discrepancy/remove', entryId: 'dl-1' }))).toBe(
      'unknown-workspace-entry',
    );
  });

  it('records admission decisions stamped with the current clock', () => {
    const s = openedSession(); // clock = 1
    expect(
      codeOf(
        s.dispatch({
          type: 'action-list/set',
          entry: {
            medKey: 'rx:rx-placeholder-alpha',
            action: 'bogus' as unknown as 'hold',
            rationaleKey: 'rat-patient-stopped',
          },
        }),
      ),
    ).toBe('invalid-entry');
    expect(
      codeOf(
        s.dispatch({
          type: 'action-list/set',
          entry: { medKey: 'rx:rx-placeholder-alpha', action: 'hold', rationaleKey: 'rat-nope' },
        }),
      ),
    ).toBe('unknown-rationale');
    run(s, {
      type: 'action-list/set',
      entry: {
        medKey: 'rx:rx-placeholder-alpha',
        action: 'hold',
        rationaleKey: 'rat-patient-stopped',
      },
    });
    expect(s.getState().workspace.actionList).toEqual([
      {
        medKey: 'rx:rx-placeholder-alpha',
        action: 'hold',
        rationaleKey: 'rat-patient-stopped',
        recordedAtMinutes: 1,
      },
    ]);
    run(s, { type: 'action-list/remove', medKey: 'rx:rx-placeholder-alpha' });
    expect(s.getState().workspace.actionList).toEqual([]);
  });
});

describe('lifecycle guards', () => {
  it('refuses a direct sign, accepts it through replay, and freezes afterwards', () => {
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const ctx = { index, rationaleKeys: new Set<string>() };
    const s0 = initialState(index);
    expect(codeOf(reduce(ctx, s0, { type: 'sign' }))).toBe('sign-via-seam');
    const signed = must(reduce(ctx, s0, { type: 'sign' }, { allowSign: true }));
    expect(signed.signedAtMinutes).toBe(0);
    expect(codeOf(reduce(ctx, signed, { type: 'open-source', sourceId: 'src-interview' }))).toBe(
      'session-signed',
    );
  });

  it('rejects an unknown action type without touching the state', () => {
    const s = newSession();
    const before = s.getState();
    const r = s.dispatch({ type: 'teleport' } as unknown as LearnerAction);
    expect(codeOf(r)).toBe('unknown-action');
    expect(s.getState()).toBe(before);
    expect(s.getLog()).toEqual([]);
  });
});
