// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { ENGINE_PACKAGE, replay, type Reducer } from './index.ts';

interface Tally {
  readonly sum: number;
  readonly count: number;
}

const tally: Reducer<Tally, number> = (state, action) => ({
  sum: state.sum + action,
  count: state.count + 1,
});

const initial: Tally = { sum: 0, count: 0 };

describe('replay', () => {
  it('exports the package name', () => {
    expect(ENGINE_PACKAGE).toBe('@medrecsim/engine');
  });

  it('folds an empty log to the initial state', () => {
    expect(replay(tally, initial, [])).toEqual(initial);
  });

  it('is replay-equivalent: whole log == prefix then suffix (property, ADR-6)', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), fc.nat(), (log, splitSeed) => {
        const split = log.length === 0 ? 0 : splitSeed % (log.length + 1);
        const whole = replay(tally, initial, log);
        const staged = replay(tally, replay(tally, initial, log.slice(0, split)), log.slice(split));
        expect(staged).toEqual(whole);
      }),
    );
  });
});
