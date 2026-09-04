// SPDX-License-Identifier: MIT
/**
 * `review-record.yaml` — encoded verbatim from docs/clinical/REVIEW-RECORD-TEMPLATE.md §1
 * (instrument v1.0). Public, versioned, dated; the source of the pre-brief badge.
 */
import { z } from 'zod';
import { REVIEW_MODEL } from '../vocab/model.ts';
import { CitationId, Kebab, Text } from '../common/ids.ts';
import { ContentVersion, SchemaVersionStamp } from '../common/versions.ts';

export const DISPOSITIONS = [
  'approved',
  'approved-with-changes',
  'returned',
  'frozen-items',
] as const;
export const RE_REVIEW_TRIGGERS = [
  'annual',
  'issue-report',
  'clinical-semantics-migration',
] as const;

export const ReviewRecordDocument = z
  .strictObject({
    recordVersion: z.number().int().min(1),
    bundleId: Kebab.describe('Matches case.yaml id or the formulary package id'),
    contentVersionReviewed: ContentVersion,
    schemaVersion: SchemaVersionStamp,
    reviewDate: z.iso.date(),
    reviewModel: z.literal(REVIEW_MODEL).describe('Fixed string; the only permitted value'),
    reviewer: z.strictObject({
      role: Text,
      credential: Text.describe('Public-safe statement; no institution'),
    }),
    checklistVersions: z.strictObject({
      clinicalSelfReview: z.string().regex(/^\d+\.\d+$/),
      stigmaSafety: z.string().regex(/^\d+\.\d+$/),
      citationPolicy: z.string().regex(/^\d+\.\d+$/),
    }),
    disposition: z.enum(DISPOSITIONS),
    changesMade: z.array(Text).default([]).describe('Required when approved-with-changes'),
    frozenItems: z.array(Text).default([]).describe('Required when frozen-items (D-RISK-004)'),
    sourcesVerified: z.array(CitationId).describe('Citation ids opened on the review date'),
    findings: z.array(
      z.strictObject({
        check: Text.describe('Checklist item id, e.g. CSR-03.2 or SS-06.1'),
        result: Text,
        note: Text.optional(),
      }),
    ),
    reReview: z.strictObject({
      triggers: z
        .tuple([
          z.literal(RE_REVIEW_TRIGGERS[0]),
          z.literal(RE_REVIEW_TRIGGERS[1]),
          z.literal(RE_REVIEW_TRIGGERS[2]),
        ])
        .describe('Fixed list from D-GOV-001; do not edit'),
      dueBy: z.iso.date().describe('reviewDate + 12 months'),
      supersedes: z.number().int().min(1).nullable().describe('Previous recordVersion or null'),
    }),
    changelogRef: z
      .string()
      .regex(/^CHANGELOG\.md#\d+\.\d+\.\d+$/)
      .describe('Bundle changelog entry that published this version'),
  })
  .describe('review-record.yaml (REVIEW-RECORD-TEMPLATE.md §1)');
export type ReviewRecordDocument = z.infer<typeof ReviewRecordDocument>;
