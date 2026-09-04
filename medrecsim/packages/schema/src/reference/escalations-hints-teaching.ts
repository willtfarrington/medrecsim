// SPDX-License-Identifier: MIT
/**
 * Expected escalations (D-CLIN-002), graduated hints (D-PED-001; located in the reference
 * layer per I-6 / tension T-6 — all three grades in one record per target so INV-HINT-001 is a
 * shape check), and teaching-note references (D-GOV-002 citations per note).
 */
import { z } from 'zod';
import {
  DiscrepancyId,
  EscalationChannelId,
  ExpectedEscalationId,
  HintId,
  TeachingNoteId,
  Text,
} from '../common/ids.ts';
import { CitationRefs } from '../common/citation.ts';
import { EvidenceRef } from '../common/refs.ts';
import { SimTime } from '../common/sim-time.ts';

export const ExpectedEscalation = z
  .strictObject({
    id: ExpectedEscalationId,
    channelId: EscalationChannelId.describe('The evidence-layer channel definition'),
    required: z.boolean().describe('true = scored as expected; false = accepted but not required'),
    whyText: Text.describe('Why the escalation is expected (plausible-consequence phrasing)'),
    byTime: SimTime.optional().describe('Latest simulated time by which it should be initiated'),
    discrepancyIds: z.array(DiscrepancyId).optional(),
    citations: CitationRefs.optional(),
  })
  .describe('Expected escalation');
export type ExpectedEscalation = z.infer<typeof ExpectedEscalation>;

export const HintGrade = z.strictObject({ text: Text });

export const Hint = z
  .strictObject({
    id: HintId,
    targetDiscrepancyId: DiscrepancyId,
    nudge: HintGrade.describe('Grade 1: a gentle pointer'),
    directed: HintGrade.describe('Grade 2: names the kind of evidence to seek'),
    revealSource: z
      .strictObject({
        text: Text,
        sourceRef: EvidenceRef.describe('The evidence unit the reveal points at'),
      })
      .describe('Grade 3: reveals where to look'),
  })
  .describe('Graduated hint (nudge → directed → reveal-source; never score-subtracting)');
export type Hint = z.infer<typeof Hint>;

export const TeachingNoteRef = z
  .strictObject({
    id: TeachingNoteId,
    anchor: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'markdown heading slug')
      .describe('Heading slug in teaching-notes.md'),
    title: Text,
    summaryText: Text.describe('One-paragraph summary rendered on the reveal card; linted'),
    citations: CitationRefs.describe('Every teaching note cites (policy §4)'),
  })
  .describe('Teaching-note reference');
export type TeachingNoteRef = z.infer<typeof TeachingNoteRef>;
