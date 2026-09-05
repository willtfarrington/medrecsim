// SPDX-License-Identifier: MIT
/**
 * fast-check generators over the exemplar's ids (ADR-6). They produce *candidate* actions —
 * many are invalid on purpose (locked nodes, unknown keys, post-T0 stamps) — so a generated
 * log exercises both the accepted and the rejected paths. Property tests dispatch the
 * candidates and reason about the log the session actually accepted.
 */
import fc from 'fast-check';
import {
  ACTION_KINDS,
  CLAIM_STATUSES,
  DISCREPANCY_TYPES,
  MECHANISMS,
} from '@medrecsim/schema/vocab';
import { CONFIDENCE_LEVELS, type LearnerAction } from '../core/actions.ts';
import type { EvidenceIndex } from '../core/evidence-index.ts';
import type { Session } from '../session.ts';

export interface Vocabulary {
  readonly sources: readonly string[];
  readonly nodes: readonly { treeId: string; nodeId: string }[];
  readonly artifacts: readonly string[];
  readonly channels: readonly string[];
  readonly medKeys: readonly string[];
  readonly claimIds: readonly string[];
  readonly rationaleKeys: readonly string[];
}

export function vocabularyOf(index: EvidenceIndex, rationaleKeys: readonly string[]): Vocabulary {
  return {
    sources: [...index.sourceOrder, 'src-bogus'],
    nodes: [
      ...[...index.nodes.keys()].map((k) => {
        const [treeId, nodeId] = k.split('/') as [string, string];
        return { treeId, nodeId };
      }),
      { treeId: 'dlg-patient', nodeId: 'q-bogus' },
    ],
    artifacts: [...index.artifactOrder, 'art-bogus'],
    channels: [...index.channelOrder, 'esc-bogus'],
    medKeys: [...index.medications.keys(), 'rx:rx-bogus'],
    claimIds: [...index.claimOrder, 'clm-bogus'],
    rationaleKeys: [...rationaleKeys, 'rat-bogus'],
  };
}

const c = <T>(xs: readonly T[]) => fc.constantFrom(...xs);

export function arbAction(v: Vocabulary): fc.Arbitrary<LearnerAction> {
  const arbHistorySet = fc
    .record({
      medKey: c(v.medKeys),
      status: c([...CLAIM_STATUSES, 'hold', 'bogus'] as const),
      confidence: c([...CONFIDENCE_LEVELS, 'bogus'] as const),
      claimIds: fc.subarray([...v.claimIds], { maxLength: 2 }),
      asOfMinutes: fc.option(fc.integer({ min: -100_000, max: 30 }), { nil: undefined }),
    })
    .map((entry): LearnerAction => ({
      type: 'history/set',
      entry: {
        medKey: entry.medKey,
        status: entry.status as LearnerAction extends { entry: { status: infer S } } ? S : never,
        confidence: entry.confidence as (typeof CONFIDENCE_LEVELS)[number],
        claimIds: entry.claimIds,
        asOfMinutes: entry.asOfMinutes,
      },
    }));
  const arbResolution = fc.oneof(
    fc.constant({ kind: 'open' as const }),
    c(v.rationaleKeys).map((rationaleKey) => ({
      kind: 'resolved-with-rationale' as const,
      rationaleKey,
    })),
    c(v.channels).map((channelId) => ({ kind: 'escalated' as const, channelId })),
  );
  const arbDiscrepancySet = fc
    .record({
      entryId: c(['dl-1', 'dl-2', 'dl-3', 'Bad Id']),
      medKey: c(v.medKeys),
      classification: fc.option(
        fc.record({ type: c(DISCREPANCY_TYPES), mechanism: c(MECHANISMS) }),
        { nil: null },
      ),
      claimIds: fc.subarray([...v.claimIds], { maxLength: 2 }),
      resolution: arbResolution,
    })
    .map((entry): LearnerAction => ({ type: 'discrepancy/set', entry }));
  const arbActionSet = fc
    .record({
      medKey: c(v.medKeys),
      action: c([...ACTION_KINDS, 'bogus'] as const),
      rationaleKey: c(v.rationaleKeys),
    })
    .map((entry): LearnerAction => ({
      type: 'action-list/set',
      entry: { ...entry, action: entry.action as (typeof ACTION_KINDS)[number] },
    }));
  return fc.oneof(
    {
      weight: 4,
      arbitrary: c(v.sources).map((sourceId): LearnerAction => ({ type: 'open-source', sourceId })),
    },
    {
      weight: 3,
      arbitrary: c(v.artifacts).map((artifactId): LearnerAction => ({
        type: 'examine-artifact',
        artifactId,
      })),
    },
    { weight: 4, arbitrary: c(v.nodes).map((n): LearnerAction => ({ type: 'ask', ...n })) },
    {
      weight: 3,
      arbitrary: c(v.channels).map((channelId): LearnerAction => ({ type: 'escalate', channelId })),
    },
    {
      weight: 3,
      arbitrary: c(v.channels).map((channelId): LearnerAction => ({
        type: 'await-escalation',
        channelId,
      })),
    },
    { weight: 3, arbitrary: arbHistorySet },
    {
      weight: 1,
      arbitrary: c(v.medKeys).map((medKey): LearnerAction => ({ type: 'history/remove', medKey })),
    },
    {
      weight: 1,
      arbitrary: c(v.sources).map((sourceId): LearnerAction => ({
        type: 'history/seed-from-source',
        sourceId,
      })),
    },
    { weight: 2, arbitrary: arbDiscrepancySet },
    {
      weight: 1,
      arbitrary: c(['dl-1', 'dl-2', 'dl-9']).map((entryId): LearnerAction => ({
        type: 'discrepancy/remove',
        entryId,
      })),
    },
    { weight: 3, arbitrary: arbActionSet },
    {
      weight: 1,
      arbitrary: c(v.medKeys).map((medKey): LearnerAction => ({
        type: 'action-list/remove',
        medKey,
      })),
    },
  );
}

export function arbCandidateLog(v: Vocabulary, maxLength = 60): fc.Arbitrary<LearnerAction[]> {
  return fc.array(arbAction(v), { maxLength });
}

/** Dispatches candidates in order and returns the log the session accepted. */
export function driveSession(
  session: Session,
  candidates: readonly LearnerAction[],
): readonly LearnerAction[] {
  for (const a of candidates) session.dispatch(a);
  return session.getLog();
}
