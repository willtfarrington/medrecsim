// SPDX-License-Identifier: MIT
/**
 * Hint recording (D-PED-001; EP-12a). A learner asks for one grade of one authored hint at a
 * time, in the graduated order nudge → directed → reveal-source, each grade once. The engine
 * records (hint id, grade, simulated minute, log sequence) and nothing else: a hint spends no
 * simulated time and touches neither the clock nor the workspace, so asking for one can never
 * move another action's timing. Scoring reads the record later (EP-12b): a discrepancy found
 * after a reveal-source hint for it is "partially met — found with support" (D-SCOR-004);
 * every other use of a hint changes nothing.
 *
 * The hint texts and their target discrepancies live in the reference layer (I-6). This module
 * compiles in the engine's evidence-only project: it sees the case's hint ids as opaque strings
 * (`ReduceContext.hintIds`) and never a hint's text. Showing the texts to the learner is EP-25's.
 */
import { HINT_TIERS, type HintTier } from './actions.ts';
import type { HandlerContext } from './context.ts';
import { fail, ok, type Result } from './errors.ts';
import type { HintRecord, SessionState } from './state.ts';

function isHintTier(value: string): value is HintTier {
  return (HINT_TIERS as readonly string[]).includes(value);
}

/** The grades of one hint the learner has already been shown, in the order shown. */
export function shownTiers(state: SessionState, hintId: string): HintTier[] {
  return state.hints.filter((h) => h.hintId === hintId).map((h) => h.tier);
}

export function requestHint(
  ctx: HandlerContext,
  state: SessionState,
  hintId: string,
  tier: string,
): Result<SessionState> {
  if (!ctx.hintIds.has(hintId)) return fail('unknown-hint', `no hint ${hintId}`, { hintId });
  if (!isHintTier(tier))
    return fail('invalid-entry', `unknown hint grade "${tier}"`, { hintId, tier });
  const shown = shownTiers(state, hintId);
  if (shown.includes(tier))
    return fail('hint-already-shown', `the ${tier} grade of ${hintId} has already been shown`, {
      hintId,
      tier,
    });
  const expected = HINT_TIERS[shown.length];
  if (tier !== expected)
    return fail(
      'hint-tier-out-of-order',
      `hints are graduated: the next grade of ${hintId} is ${String(expected)}, not ${tier}`,
      { hintId, tier, expected: expected ?? null },
    );
  const record: HintRecord = {
    hintId,
    tier,
    atMinutes: state.clock.minutesSinceT0,
    seq: state.appliedActions,
  };
  return ok({ ...state, hints: [...state.hints, record] });
}
