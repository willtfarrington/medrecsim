// SPDX-License-Identifier: MIT
/**
 * `case.yaml` — bundle metadata (architecture §3): identity, versions, tier, coverage
 * declarations (checked against the reference layer by INV-META-001), review linkage and the
 * pre-brief badge (D-RISK-003), the pre-brief itself (D-PED-001), and version ranges for the
 * shared content packages.
 */
import { z } from 'zod';
import { DISCREPANCY_TYPES, MECHANISMS, PHENOTYPES } from '../vocab/taxonomy.ts';
import { REVIEW_MODEL, REVIEW_STATUSES, TIERS } from '../vocab/model.ts';
import { CaseId, Kebab, Text } from '../common/ids.ts';
import { ContentVersion, ContentVersionRange, SchemaVersionStamp } from '../common/versions.ts';

export const SENSITIVE_CONTENT_TAGS = [
  'opioid-use-disorder-therapy',
  'psychiatric-medication',
  'hiv-antiretroviral-therapy',
  'impaired-capacity-surrogate',
  'non-english-preferring',
] as const;

export const Coverage = z
  .strictObject({
    types: z
      .array(z.enum(DISCREPANCY_TYPES))
      .min(1)
      .describe('Must equal the set of discrepancy types in reference.yaml'),
    mechanisms: z
      .array(z.enum(MECHANISMS))
      .min(1)
      .describe('Must equal the set of primary mechanisms in reference.yaml'),
    phenotypes: z
      .array(z.enum(PHENOTYPES))
      .describe('D-TAX-002 predicates P1–P10 this case covers (EP-20 verifies)'),
    highAlert: z.boolean().describe('Any referenced formulary entry is high-alert'),
    recordIsWrong: z
      .boolean()
      .describe(
        'An electronic/dispensing source is wrong and the patient or caregiver is right (D-CASE-002)',
      ),
    allergySubTask: z.boolean().describe('Contains an allergy-record-discrepancy (D-MED-003)'),
    sensitiveContent: z.array(z.enum(SENSITIVE_CONTENT_TAGS)).optional(),
  })
  .describe('Coverage declarations');

export const PreBriefBadge = z
  .strictObject({
    label: z.literal(REVIEW_MODEL).describe('Fixed string, rendered verbatim'),
    recordVersion: z.number().int().min(1),
    reviewDate: z.iso.date(),
    staleAfter: z.iso.date().describe('= review-record reReview.dueBy; amber rule after this date'),
  })
  .describe('Pre-brief badge fields copied from review-record.yaml (REVIEW-RECORD-TEMPLATE §2)');

export const PreBrief = z
  .strictObject({
    objectives: z.array(Text).min(1),
    roleFramingText: Text.describe('"You are the admitting clinician…" (D-WF-003)'),
    syntheticNotice: z
      .literal(true)
      .describe('The synthetic banner is always shown (INV-SCOPE-001)'),
  })
  .describe('Pre-brief (D-PED-001)');

export const CaseDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    id: CaseId,
    slug: Kebab.describe('URL slug; normally the id without its cNN- prefix'),
    title: Text,
    contentVersion: ContentVersion.describe('Per-bundle version (D-DATA-002)'),
    tier: z.enum(TIERS),
    recommendedSequenceIndex: z.number().int().min(1),
    coverage: Coverage,
    reviewStatus: z
      .enum(REVIEW_STATUSES)
      .describe('draft-unreviewed bundles validate with a warning and are not publishable'),
    reviewRecordRef: z
      .string()
      .regex(/^review-record\.yaml$/)
      .optional()
      .describe('Path relative to the bundle root; required when reviewStatus is reviewed'),
    preBriefBadge: PreBriefBadge.optional(),
    preBrief: PreBrief,
    estimatedMinutes: z.number().int().positive(),
    formularyVersionRange: ContentVersionRange,
    universeVersionRange: ContentVersionRange.optional(),
  })
  .describe('case.yaml — bundle metadata');
export type CaseDocument = z.infer<typeof CaseDocument>;
export type CaseInput = z.input<typeof CaseDocument>;
