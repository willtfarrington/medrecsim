// SPDX-License-Identifier: MIT
/**
 * Opening evidence sources and examining physical artifacts (D-WF-001, D-WF-002). Opening a
 * source spends its authored access cost and makes its `with-source` claims visible; a
 * time-gated source cannot be opened before its authored instant. Examining an artifact spends
 * its cost and reveals the claims its label asserts.
 */
import type { HandlerContext } from './context.ts';
import { reveal } from './context.ts';
import { fail, ok, type Result } from './errors.ts';
import { isSourceOpened, type SessionState } from './state.ts';

export function openSource(
  ctx: HandlerContext,
  state: SessionState,
  sourceId: string,
): Result<SessionState> {
  const source = ctx.index.sources.get(sourceId);
  if (source === undefined) return fail('unknown-source', `no source ${sourceId}`, { sourceId });
  if (isSourceOpened(state, sourceId))
    return fail('source-already-opened', `${sourceId} is already open`, { sourceId });
  if (source.availability === 'time-gated') {
    const availableAt = ctx.index.availableFromMinutes.get(sourceId) ?? 0;
    if (state.clock.minutesSinceT0 < availableAt) {
      return fail('source-not-yet-available', `${sourceId} is not available yet`, {
        sourceId,
        availableAtMinutes: availableAt,
        nowMinutes: state.clock.minutesSinceT0,
      });
    }
  }
  let s = ctx.advance(state, source.accessCostMinutes);
  const at = s.clock.minutesSinceT0;
  s = { ...s, sources: [...s.sources, { sourceId, openedAtMinutes: at }] };
  const claimIds = ctx.index.claimOrder.filter((id) => {
    const c = ctx.index.claims.get(id);
    return c !== undefined && c.sourceId === sourceId && c.visibility === 'with-source';
  });
  const allergyClaimIds = ctx.index.allergyClaimOrder.filter((id) => {
    const a = ctx.index.allergyClaims.get(id);
    return a !== undefined && a.sourceId === sourceId && !ctx.index.onRevealAllergyClaimIds.has(id);
  });
  s = reveal(s, claimIds, allergyClaimIds, at, { kind: 'source-open', sourceId });
  return ok(s);
}

export function examineArtifact(
  ctx: HandlerContext,
  state: SessionState,
  artifactId: string,
): Result<SessionState> {
  const artifact = ctx.index.artifacts.get(artifactId);
  if (artifact === undefined)
    return fail('unknown-artifact', `no artifact ${artifactId}`, { artifactId });
  if (!isSourceOpened(state, artifact.sourceId))
    return fail('source-not-opened', `open ${artifact.sourceId} before examining ${artifactId}`, {
      artifactId,
      sourceId: artifact.sourceId,
    });
  if (state.examined.some((e) => e.artifactId === artifactId))
    return fail('artifact-already-examined', `${artifactId} was already examined`, {
      artifactId,
    });
  let s = ctx.advance(state, artifact.examineCostMinutes);
  const at = s.clock.minutesSinceT0;
  s = { ...s, examined: [...s.examined, { artifactId, atMinutes: at }] };
  s = reveal(s, artifact.labelClaims, [], at, { kind: 'artifact', artifactId });
  return ok(s);
}
