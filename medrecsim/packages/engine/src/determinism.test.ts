// SPDX-License-Identifier: MIT
/**
 * Determinism fence, runtime half (architecture §2; ADR-6). Same log ⇒ identical state, on
 * ≥ 1000 generated logs; replay is prefix/suffix equivalent; the reducer never mutates its
 * inputs; the stable serializer is stable.
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import type { LearnerAction } from './core/actions.ts';
import { buildEvidenceIndex } from './core/evidence-index.ts';
import { reduce, replay } from './core/reduce.ts';
import { stableStringify } from './core/serialize.ts';
import { initialState, type SessionState } from './core/state.ts';
import { createSession } from './session.ts';
import {
  arbAction,
  arbCandidateLog,
  driveSession,
  vocabularyOf,
} from './test-support/arbitraries.ts';
import { exemplarCase } from './test-support/exemplar.ts';
import { APP_VERSION, newSession } from './test-support/session.ts';

const compiled = exemplarCase();
const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
const rationaleKeys = compiled.reference.actionSets.rationaleMenu.map((m) => m.key);
const vocab = vocabularyOf(index, rationaleKeys);
const ctx = { index, rationaleKeys: new Set(rationaleKeys) };

function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const v of Object.values(value as Record<string, unknown>)) deepFreeze(v);
  }
  return value;
}

describe('same log ⇒ identical state', () => {
  it('holds across 1000 generated logs, including the stable serialization', () => {
    let totalAccepted = 0;
    fc.assert(
      fc.property(arbCandidateLog(vocab), (candidates) => {
        const a = newSession(compiled);
        const accepted = driveSession(a, candidates);
        totalAccepted += accepted.length;
        const b = createSession({ case: compiled, appVersion: APP_VERSION, log: accepted });
        expect(b.getState()).toEqual(a.getState());
        expect(stableStringify(b.getState())).toBe(stableStringify(a.getState()));
        expect(b.serialize()).toEqual(a.serialize());
        // A third fold, by dispatching the accepted log one action at a time, agrees too.
        const c = newSession(compiled);
        for (const action of accepted) {
          const r = c.dispatch(action);
          expect(r.ok).toBe(true);
        }
        expect(stableStringify(c.getState())).toBe(stableStringify(a.getState()));
      }),
      { numRuns: 1000 },
    );
    expect(totalAccepted).toBeGreaterThan(1000);
  });

  it('is replay-equivalent: whole log == prefix then suffix', () => {
    fc.assert(
      fc.property(arbCandidateLog(vocab), fc.nat(), (candidates, splitSeed) => {
        const accepted = driveSession(newSession(compiled), candidates);
        const split = accepted.length === 0 ? 0 : splitSeed % (accepted.length + 1);
        const whole = replay(ctx, initialState(index), accepted);
        const mid = replay(ctx, initialState(index), accepted.slice(0, split));
        const staged = replay(ctx, mid.state, accepted.slice(split));
        expect(whole.failure).toBeNull();
        expect(staged.failure).toBeNull();
        expect(stableStringify(staged.state)).toBe(stableStringify(whole.state));
      }),
      { numRuns: 300 },
    );
  });
});

describe('reducer purity', () => {
  it('never mutates the state it is given (deep-frozen inputs, 300 logs)', () => {
    fc.assert(
      fc.property(arbCandidateLog(vocab), (candidates) => {
        let state: SessionState = deepFreeze(initialState(index));
        for (const action of candidates) {
          deepFreeze(action);
          const r = reduce(ctx, state, action);
          if (r.ok) state = deepFreeze(r.value);
        }
      }),
      { numRuns: 300 },
    );
  });

  it('gives structurally equal results when applied twice to the same input', () => {
    fc.assert(
      fc.property(arbCandidateLog(vocab), arbAction(vocab), (candidates, action) => {
        const accepted = driveSession(newSession(compiled), candidates);
        const state = replay(ctx, initialState(index), accepted).state;
        const r1 = reduce(ctx, state, action);
        const r2 = reduce(ctx, state, action);
        expect(stableStringify(r1)).toBe(stableStringify(r2));
      }),
      { numRuns: 300 },
    );
  });
});

describe('stableStringify', () => {
  it('sorts keys, keeps array order, drops undefined members', () => {
    const a = { b: 1, a: [3, { z: undefined, y: 2 }], c: null };
    const b = { c: null, a: [3, { y: 2 }], b: 1 };
    expect(stableStringify(a)).toBe(stableStringify(b));
    expect(stableStringify(a)).toBe('{"a":[3,{"y":2}],"b":1,"c":null}');
  });

  it('agrees with JSON.parse round-trips (property)', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const once = stableStringify(value);
        expect(stableStringify(JSON.parse(once))).toBe(once);
      }),
      { numRuns: 300 },
    );
  });
});

describe('the accepted log stays a valid log', () => {
  it('contains only shape-valid actions', () => {
    const accepted: readonly LearnerAction[] = driveSession(newSession(compiled), [
      { type: 'open-source', sourceId: 'src-bogus' },
      { type: 'open-source', sourceId: 'src-interview' },
    ]);
    expect(accepted).toEqual([{ type: 'open-source', sourceId: 'src-interview' }]);
  });
});
