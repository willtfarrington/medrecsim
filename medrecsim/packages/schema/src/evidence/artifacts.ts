// SPDX-License-Identifier: MIT
/** Physical artifacts (bottles, pillbox, paper lists) with nonvisual render text (D-UX-004). */
import { z } from 'zod';
import { ArtifactId, ClaimId, SourceId, Text } from '../common/ids.ts';

export const ARTIFACT_KINDS = [
  'pill-bottle',
  'pillbox',
  'handwritten-list',
  'printed-list',
  'discharge-paper',
  'pharmacy-receipt',
  'photo',
  'other',
] as const;

export const Artifact = z
  .strictObject({
    id: ArtifactId,
    sourceId: SourceId.describe('The physical-artifacts source (or the informant who brought it)'),
    kind: z.enum(ARTIFACT_KINDS),
    title: Text,
    renderText: Text.describe(
      'Complete textual rendering of the artifact including nonvisual cues (label wording, pill appearance in words, fill dates, count) — INV-A11Y-001',
    ),
    labelClaims: z.array(ClaimId).default([]).describe('Claims the artifact label asserts'),
    examineCostMinutes: z.number().int().nonnegative(),
  })
  .describe('Physical artifact (evidence layer)');
export type Artifact = z.infer<typeof Artifact>;
