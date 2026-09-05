// SPDX-License-Identifier: MIT
/** Shared handler context: the evidence index, the sanctioned rationale keys, and the clock. */
import type { EvidenceIndex } from './evidence-index.ts';
import type { RevealRecord, RevealVia, SessionState } from './state.ts';

export interface ReduceContext {
  readonly index: EvidenceIndex;
  /**
   * Keys the learner may choose a justification from (D-MED-004: no free text). The session
   * extracts them from the authored rationale menu; the reducer sees opaque strings only.
   */
  readonly rationaleKeys: ReadonlySet<string>;
}

export interface HandlerContext extends ReduceContext {
  /** Spend authored minutes: fires crossed threshold events, then moves the clock. */
  readonly advance: (state: SessionState, minutes: number) => SessionState;
}

/** Records first-time reveals of claims and allergy claims (later reveals are no-ops). */
export function reveal(
  state: SessionState,
  claimIds: readonly string[],
  allergyClaimIds: readonly string[],
  atMinutes: number,
  via: RevealVia,
): SessionState {
  const reveals: RevealRecord[] = [...state.reveals];
  const seen = new Set(state.reveals.map((r) => r.claimId));
  for (const claimId of claimIds) {
    if (seen.has(claimId)) continue;
    seen.add(claimId);
    reveals.push({ claimId, atMinutes, via });
  }
  const allergyReveals: RevealRecord[] = [...state.allergyReveals];
  const seenAllergy = new Set(state.allergyReveals.map((r) => r.claimId));
  for (const claimId of allergyClaimIds) {
    if (seenAllergy.has(claimId)) continue;
    seenAllergy.add(claimId);
    allergyReveals.push({ claimId, atMinutes, via });
  }
  if (
    reveals.length === state.reveals.length &&
    allergyReveals.length === state.allergyReveals.length
  )
    return state;
  return { ...state, reveals, allergyReveals };
}
