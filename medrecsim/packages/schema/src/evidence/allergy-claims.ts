// SPDX-License-Identifier: MIT
/**
 * Allergy / intolerance claims on the same source-claim machinery (D-MED-003): agent,
 * reaction, severity, timing, verification status, prior tolerance. Discriminated on
 * `claimKind`.
 */
import { z } from 'zod';
import { AllergyClaimId, FormularyId, SourceId, Text } from '../common/ids.ts';
import { SimTime } from '../common/sim-time.ts';

export const ALLERGY_SEVERITIES = ['mild', 'moderate', 'severe', 'anaphylaxis', 'unknown'] as const;
export const VERIFICATION_STATUSES = [
  'patient-reported',
  'caregiver-reported',
  'documented-unverified',
  'documented-verified',
  'unknown',
] as const;

export const AllergyAgent = z
  .discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('formulary'), formularyId: FormularyId }),
    z.strictObject({
      kind: z.literal('class-or-text'),
      text: Text.describe('Drug class or non-formulary agent as stated, e.g. "penicillins"'),
    }),
  ])
  .describe('The agent an allergy claim is about');

const base = {
  id: AllergyClaimId,
  sourceId: SourceId,
  verificationStatus: z.enum(VERIFICATION_STATUSES),
  eventTime: SimTime.describe('When the asserted state was true (D-MED-002)'),
  documentationTime: SimTime.describe('When the source recorded it; never before eventTime'),
  asStatedText: Text.describe('Verbatim wording the learner sees from this source'),
};

const reaction = {
  agent: AllergyAgent,
  reactionText: Text.optional().describe('Reaction as stated'),
  severity: z.enum(ALLERGY_SEVERITIES),
  onsetTimingText: Text.optional().describe('When it happened, as stated'),
  priorToleranceText: Text.optional().describe('Any stated later tolerance of the agent or class'),
};

export const AllergyClaim = z
  .discriminatedUnion('claimKind', [
    z.strictObject({ claimKind: z.literal('allergy'), ...base, ...reaction }),
    z.strictObject({ claimKind: z.literal('intolerance'), ...base, ...reaction }),
    z.strictObject({
      claimKind: z.literal('tolerated-exposure'),
      ...base,
      agent: AllergyAgent,
      exposureText: Text.describe('The exposure that was tolerated, as stated'),
    }),
    z.strictObject({ claimKind: z.literal('no-known-allergies'), ...base }),
  ])
  .describe('Allergy claim (evidence layer; D-MED-003)');
export type AllergyClaim = z.infer<typeof AllergyClaim>;
