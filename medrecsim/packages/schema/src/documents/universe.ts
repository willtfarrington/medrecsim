// SPDX-License-Identifier: MIT
/**
 * Fictional-universe registry (integrator resolution I-9): the shared content package beside
 * the formulary that names fictional institutions, pharmacies, programs and recurring people,
 * so cases reference them by id and the originality checklist (EP-10) has one place to screen.
 */
import { z } from 'zod';
import { InstitutionId, Kebab, PersonId, Text } from '../common/ids.ts';
import { ContentVersion, SchemaVersionStamp } from '../common/versions.ts';

export const INSTITUTION_KINDS = [
  'hospital',
  'clinic',
  'community-pharmacy',
  'opioid-treatment-program',
  'urgent-care',
  'specialty-office',
  'community-mental-health',
  'other',
] as const;

export const UniverseDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    id: Kebab,
    universeVersion: ContentVersion,
    institutions: z
      .array(
        z.strictObject({
          id: InstitutionId,
          name: Text.describe(
            'Original fictional name (trade-dress originality checklist, D-UX-001)',
          ),
          kind: z.enum(INSTITUTION_KINDS),
          descriptionText: Text,
          placeholder: z.literal(true).optional(),
        }),
      )
      .min(1),
    people: z
      .array(
        z.strictObject({
          id: PersonId,
          displayName: Text,
          role: Text.describe('e.g. community pharmacist, PCP, OTP nurse'),
          placeholder: z.literal(true).optional(),
        }),
      )
      .default([]),
  })
  .describe('universe.yaml — fictional-universe registry (I-9)');
export type UniverseDocument = z.infer<typeof UniverseDocument>;
