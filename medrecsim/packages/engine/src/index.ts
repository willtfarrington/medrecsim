// SPDX-License-Identifier: MIT
/**
 * @medrecsim/engine — scaffold (EP-8). The engine proper lands at EP-11/EP-12.
 *
 * Invariants this package must always satisfy (D-ARCH-006, architecture §2):
 * - zero DOM dependencies (tsconfig `lib` excludes DOM; ESLint determinism rule);
 * - no wall clock, randomness, or async in any reducer;
 * - state is a fold over an append-only action log (event sourcing).
 */

export const ENGINE_PACKAGE = '@medrecsim/engine';

/** A pure state transition. */
export type Reducer<S, A> = (state: S, action: A) => S;

/**
 * Event-sourced fold: `state = replay(reduce, initial, log)`.
 * Replay equivalence (replaying a whole log equals replaying its prefix, then its suffix from
 * the intermediate state) is checked by a property test and is the basis of resume-from-storage.
 */
export function replay<S, A>(reduce: Reducer<S, A>, initial: S, log: readonly A[]): S {
  let state = initial;
  for (const action of log) {
    state = reduce(state, action);
  }
  return state;
}
