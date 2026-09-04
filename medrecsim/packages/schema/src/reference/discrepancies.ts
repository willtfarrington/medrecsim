// SPDX-License-Identifier: MIT
/**
 * Discrepancies with the five-axis taxonomy (D-TAX-001; TAXONOMY.md §8 verbatim), detectability
 * paths in disjunctive normal form (tension T-4), the three harm ordinals, the resolution
 * expectation, and the per-item scoring state (D-RISK-004 freeze).
 */
import { z } from 'zod';
import {
  DETECTABILITIES,
  DISCREPANCY_TYPES,
  MECHANISMS,
  REVERSIBILITIES,
  SEVERITIES,
  TIMES_TO_HARM,
  URGENCIES,
} from '../vocab/taxonomy.ts';
import { RESOLUTION_EXPECTATIONS, SCORING_STATES } from '../vocab/model.ts';
import {
  AllergyClaimId,
  ClaimId,
  DiscrepancyId,
  RegimenId,
  ActualUseId,
  TeachingNoteId,
  Text,
} from '../common/ids.ts';
import { CitationRefs } from '../common/citation.ts';
import { MedicationRefFields } from '../common/medication.ts';
import { EvidenceRef } from '../common/refs.ts';

/**
 * One way to detect the discrepancy: ALL of `requires` must be reached. The discrepancy's
 * `detectabilityPaths` array is an OR over paths (T-4: DNF).
 */
export const DetectabilityPath = z
  .strictObject({
    detectability: z.enum(DETECTABILITIES).describe('Taxonomy axis 3 token for this path'),
    requires: z
      .array(EvidenceRef)
      .min(1)
      .describe('Evidence units that must ALL be accessed for this path (AND); paths are OR-ed'),
  })
  .describe('Detectability path (AND inside, OR across paths)');

export const Classification = z.strictObject({
  type: z.enum(DISCREPANCY_TYPES),
  mechanism: z.enum(MECHANISMS),
});

export const Discrepancy = z
  .strictObject({
    id: DiscrepancyId,
    title: Text.describe('Short author-facing title; also the debrief reveal-card heading'),
    type: z.enum(DISCREPANCY_TYPES).describe('Axis 1 — exactly one'),
    mechanism: z.enum(MECHANISMS).describe('Axis 2 — the primary mechanism'),
    secondaryMechanisms: z
      .array(z.enum(MECHANISMS))
      .optional()
      .describe('Optional additional mechanisms'),
    detectabilityPaths: z.array(DetectabilityPath).min(1).describe('Axis 3 — at least one path'),
    urgency: z.enum(URGENCIES).describe('Axis 4'),
    severity: z
      .enum(SEVERITIES)
      .describe('Axis 5a — potential worst-credible outcome (MERP adaptation)'),
    reversibility: z.enum(REVERSIBILITIES).describe('Axis 5b'),
    timeToHarm: z.enum(TIMES_TO_HARM).describe('Axis 5c (physiologic tempo; not urgency)'),
    involves: z
      .strictObject({
        ...MedicationRefFields,
        claimIds: z.array(ClaimId).optional().describe('Evidence claims in disagreement'),
        allergyClaimIds: z.array(AllergyClaimId).optional(),
        regimenId: RegimenId.optional(),
        actualUseId: ActualUseId.optional(),
      })
      .describe('What the discrepancy is between'),
    resolutionExpectation: z.strictObject({
      kind: z.enum(RESOLUTION_EXPECTATIONS),
      detailText: Text.describe('What a correct resolution looks like at signature (D-WF-004)'),
    }),
    acceptedClassifications: z
      .array(Classification)
      .optional()
      .describe(
        'Alternative type/mechanism pairs also accepted at scoring (D-MED-005 accepted sets)',
      ),
    scoring: z
      .enum(SCORING_STATES)
      .default('scored')
      .describe('D-RISK-004: discussion-item-not-scored while frozen'),
    freezeNoteText: Text.optional().describe('Required when scoring is discussion-item-not-scored'),
    citations: CitationRefs.optional().describe(
      'Ordinal anchors and drug-specific sources (policy §4)',
    ),
    teachingNoteId: TeachingNoteId.optional(),
  })
  .describe('Discrepancy (reference layer)');
export type Discrepancy = z.infer<typeof Discrepancy>;
