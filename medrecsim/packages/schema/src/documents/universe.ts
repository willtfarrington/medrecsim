// SPDX-License-Identifier: MIT
/**
 * Fictional-universe registry (integrator resolution I-9): the shared content package beside
 * the formulary that names fictional institutions, pharmacies, programs and recurring people,
 * so cases reference them by id and the originality checklist (docs/ORIGINALITY-CHECKLIST.md,
 * EP-10) has one place to screen. Every non-placeholder entry carries its screening record
 * (docs/NAME-SCREEN.md, fictional in-sim rule) and every identifier is visibly fictional
 * (vocab/synthetic-identifiers.ts).
 */
import { z } from 'zod';
import { InstitutionId, Kebab, PersonId, Text } from '../common/ids.ts';
import { ContentVersion, SchemaVersionStamp } from '../common/versions.ts';
import {
  FICTIONAL_PHONE_RE,
  SYNTHETIC_NPI_RE,
  SYNTHETIC_POSTAL_CODE_RE,
} from '../vocab/synthetic-identifiers.ts';

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

/** Screening venues from docs/NAME-SCREEN.md adapted to in-sim names (V4, V5, V6 + stigma). */
export const SCREENING_VENUES = ['web', 'rdap', 'uspto-mirror', 'stigma-safety'] as const;

/** Collision grades from docs/NAME-SCREEN.md. A fictional name graded L2 or L3 is renamed. */
export const SCREENING_GRADES = ['L0', 'L1', 'L2', 'L3'] as const;

export const ScreeningRecord = z
  .strictObject({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO date YYYY-MM-DD')
      .describe('Date the screen was run'),
    venues: z
      .array(z.enum(SCREENING_VENUES))
      .min(1)
      .describe('Venues actually queried (NAME-SCREEN.md fictional in-sim rule)'),
    grade: z.enum(SCREENING_GRADES).describe('Highest collision grade found; L2+ means rename'),
    note: Text.describe('What was searched and what was found, in one or two sentences'),
  })
  .describe('Name-screening record (docs/NAME-SCREEN.md, fictional in-sim rule)');
export type ScreeningRecord = z.infer<typeof ScreeningRecord>;

const Phone = z
  .string()
  .regex(FICTIONAL_PHONE_RE, 'fictional phone number 555-01XX')
  .describe('Visibly fictional phone/fax number: 555-01XX');

const Npi = z
  .string()
  .regex(SYNTHETIC_NPI_RE, 'synthetic NPI: ten digits starting with 0')
  .describe('Synthetic NPI: ten digits, leading 0, invalid check digit (INV-SCOPE-001)');

const PostalCode = z
  .string()
  .regex(SYNTHETIC_POSTAL_CODE_RE, 'synthetic postal code 000NN')
  .describe('Synthetic postal code: 000NN');

export const InstitutionIdentifiers = z
  .strictObject({
    phone: Phone.optional(),
    fax: Phone.optional(),
    npi: Npi.optional(),
    streetText: Text.optional().describe('Fictional street address line'),
    postalCode: PostalCode.optional(),
  })
  .describe('Visibly fictional identifiers rendered on artifacts and channel headers');

export const PersonIdentifiers = z
  .strictObject({
    npi: Npi.optional(),
    phone: Phone.optional(),
  })
  .describe('Visibly fictional identifiers for a person');

export const Institution = z
  .strictObject({
    id: InstitutionId,
    name: Text.describe('Original fictional name (trade-dress originality checklist, D-UX-001)'),
    shortName: Text.optional().describe('Short form for chart tabs and labels'),
    kind: z.enum(INSTITUTION_KINDS),
    descriptionText: Text,
    identifiers: InstitutionIdentifiers.optional(),
    screening: ScreeningRecord.optional().describe(
      'Required unless placeholder: true (INV-SCOPE-001)',
    ),
    placeholder: z.literal(true).optional(),
  })
  .describe('Fictional institution');
export type Institution = z.infer<typeof Institution>;

export const Person = z
  .strictObject({
    id: PersonId,
    displayName: Text.describe('Fictional name as shown, e.g. "Anneliese Okafor, MD"'),
    role: Text.describe('e.g. community pharmacist, primary-care physician, admitting nurse'),
    institutionId: InstitutionId.optional().describe('Where this person works, if fixed'),
    identifiers: PersonIdentifiers.optional(),
    screening: ScreeningRecord.optional().describe(
      'Required unless placeholder: true (INV-SCOPE-001)',
    ),
    placeholder: z.literal(true).optional(),
  })
  .describe('Recurring fictional person (NPCs and escalation targets, D-WF-003)');
export type Person = z.infer<typeof Person>;

export const Locality = z
  .strictObject({
    cityName: Text.describe('Fictional city every institution sits in (D-PROD-004: fictional US)'),
    regionText: Text.describe(
      'How the region is written on artifacts, e.g. "no state named"; never a real state',
    ),
    screening: ScreeningRecord,
  })
  .describe('The fictional locality shared by every institution');
export type Locality = z.infer<typeof Locality>;

export const UniverseDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    id: Kebab,
    universeVersion: ContentVersion,
    locality: Locality.optional().describe('Absent only in a placeholder scaffold'),
    institutions: z.array(Institution).min(1),
    people: z.array(Person).default([]),
  })
  .describe('universe.yaml — fictional-universe registry (I-9)');
export type UniverseDocument = z.infer<typeof UniverseDocument>;
