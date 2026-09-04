// SPDX-License-Identifier: MIT
/**
 * Citation record — the ten-key shape from docs/clinical/CITATION-POLICY.md §1, encoded
 * verbatim (D-GOV-002; instrument v1.0). Records live in a bundle's `citations.yaml`; every
 * other location references them by id (policy §4).
 */
import { z } from 'zod';
import { CitationId } from './ids.ts';

export const CITATION_TIERS = ['A', 'B', 'C', 'D'] as const;
export type CitationTier = (typeof CITATION_TIERS)[number];

export const CitationRecord = z
  .strictObject({
    id: CitationId,
    claim: z.string().min(1).describe('The single clinical statement this citation supports'),
    source: z
      .string()
      .regex(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, 'UPPER-KEBAB source key')
      .describe('Short canonical source key from CITATION-POLICY.md §7 (mirrored in the registry)'),
    publisher: z.string().min(1).describe('Issuing body as it names itself'),
    title: z.string().min(1).describe('Document title as published'),
    'version-or-date': z
      .string()
      .min(1)
      .describe('Edition, effective/revision date, or "undated (accessed <date>)"'),
    url: z.url().describe('Public URL of the document or its bibliographic landing page'),
    accessed: z.iso.date().describe('ISO date the citing session actually opened the source'),
    tier: z.enum(CITATION_TIERS).describe('Approved-source tier (policy §2)'),
    notes: z
      .string()
      .describe('Page pointers, quoted wording, transition/archive notes; may be empty'),
  })
  .describe('Citation record (CITATION-POLICY.md §1, ten keys)');
export type CitationRecord = z.infer<typeof CitationRecord>;

/** A non-empty list of citation ids attached to a scored clinical rule. */
export const CitationRefs = z
  .array(CitationId)
  .min(1)
  .describe('Citation ids (must resolve in citations.yaml)');
