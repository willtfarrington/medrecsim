// SPDX-License-Identifier: MIT
/**
 * Medication claims: one source asserting one thing about one medication, with the D-MED-001
 * status vocabulary and D-MED-002 dual timestamps. Claims are the reveal atom (tension T-3):
 * a source that asserts two distinct things about the same medication authors two claims.
 */
import { z } from 'zod';
import { CLAIM_STATUSES } from '../vocab/claim-status.ts';
import { ROUTES } from '../vocab/model.ts';
import { ClaimId, SourceId, Text } from '../common/ids.ts';
import { MedicationRefFields } from '../common/medication.ts';
import { SimTime } from '../common/sim-time.ts';

export const CLAIM_VISIBILITIES = ['with-source', 'on-reveal'] as const;

export const Claim = z
  .strictObject({
    id: ClaimId,
    sourceId: SourceId.describe('The source making this claim'),
    ...MedicationRefFields,
    claimStatus: z.enum(CLAIM_STATUSES).describe('D-MED-001 per-source status'),
    howTakingDifferently: Text.optional().describe(
      'Required when claimStatus is taking-differently: how, in the source’s words',
    ),
    dose: Text.optional().describe('Dose as stated, e.g. "5 mg"'),
    route: z.enum(ROUTES).optional(),
    frequency: Text.optional().describe('Frequency as stated, e.g. "once daily"'),
    formulation: Text.optional().describe('Formulation as stated, e.g. "extended-release tablet"'),
    eventTime: SimTime.describe('When the asserted state was true (D-MED-002)'),
    documentationTime: SimTime.describe('When the source recorded it; never before eventTime'),
    asStatedText: Text.describe('Verbatim wording the learner sees from this source'),
    visibility: z
      .enum(CLAIM_VISIBILITIES)
      .default('with-source')
      .describe(
        'with-source = visible when the source is opened; on-reveal = only when a dialogue node, artifact, or escalation reveals it',
      ),
  })
  .describe('Medication claim (evidence layer)');
export type Claim = z.infer<typeof Claim>;
