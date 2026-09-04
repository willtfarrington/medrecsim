// SPDX-License-Identifier: MIT
/**
 * How content names a medication (D-DATA-004 with the T-2 escape hatch).
 *
 * Exactly one of `formularyId` / `unresolvedLabel` must be present — INV-REF-001 enforces the
 * XOR and resolves the id against the formulary package. The escape hatch exists for the
 * pedagogically real "little white pill" that no formulary entry can name; it is sanctioned
 * only with an explicit flag and one of the closed reasons, so escapes stay countable.
 */
import { z } from 'zod';
import { UNRESOLVED_LABEL_REASONS } from '../vocab/model.ts';
import { FormularyId, Text } from './ids.ts';

export const UnresolvedLabel = z
  .strictObject({
    text: Text.describe('The label or description as the source gives it'),
    sanctioned: z.literal(true).describe('Explicit escape flag (T-2); must be true'),
    reason: z.enum(UNRESOLVED_LABEL_REASONS).describe('Why no formulary id can be assigned'),
  })
  .describe('Sanctioned unresolved medication label (escape hatch from D-DATA-004)');

export const MedicationRefFields = {
  formularyId: FormularyId.optional().describe('Formulary entry id (preferred; D-DATA-004)'),
  unresolvedLabel: UnresolvedLabel.optional(),
};

export const MedicationRef = z.strictObject(MedicationRefFields);
export type MedicationRef = z.infer<typeof MedicationRef>;
