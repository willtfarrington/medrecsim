// SPDX-License-Identifier: MIT
/**
 * Patient header and admission anchor (learner-observable). Synthetic by construction: no
 * date of birth, no record-number field — the chart id is a visibly synthetic token.
 */
import { z } from 'zod';
import { Text } from '../common/ids.ts';

export const Surrogate = z
  .strictObject({
    displayName: Text,
    relationship: Text.describe('e.g. daughter, spouse'),
    authorizationText: Text.describe(
      'How the surrogate is authorized, stated explicitly in-case (D-CONS-001)',
    ),
  })
  .describe('Authorized surrogate decision-maker / primary informant');

export const Capacity = z
  .discriminatedUnion('status', [
    z.strictObject({ status: z.literal('intact') }),
    z.strictObject({
      status: z.literal('impaired'),
      assessmentText: Text.describe('Capacity assessment is authored fact, not a learner task'),
      surrogate: Surrogate,
    }),
  ])
  .describe('Decision-making capacity at admission (D-CONS-001)');

export const Patient = z
  .strictObject({
    displayName: Text.describe('Fictional name (fictional-universe registry, EP-10/I-9)'),
    age: z.number().int().min(18).max(120).describe('Age in years (adult general medicine)'),
    sexRecorded: z.enum(['female', 'male', 'other', 'unknown']).optional(),
    pronouns: Text.optional(),
    preferredLanguage: Text.describe('e.g. English, Spanish'),
    interpreterNeeded: z
      .boolean()
      .describe('Professional interpreter is the modeled-correct action when true (D-CONS-002)'),
    chartId: z
      .string()
      .regex(/^SYN-\d{4,6}$/, 'SYN-<digits>')
      .describe('Visibly synthetic chart identifier (never MRN-like)'),
    admissionContextText: Text.describe('Presenting problem and setting in plain words'),
    capacity: Capacity,
  })
  .describe('Patient header (evidence layer)');
export type Patient = z.infer<typeof Patient>;
