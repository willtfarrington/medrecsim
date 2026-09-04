// SPDX-License-Identifier: MIT
/**
 * Reference regimen and actual-use state (author-only; D-MED-005). The reference regimen is
 * what was prescribed/intended before admission; the actual-use state is what the patient was
 * really doing, each fact carrying a knowability mark so irreducible uncertainty is preserved
 * rather than resolved by fiat.
 */
import { z } from 'zod';
import { ACTUAL_USE_STATUSES } from '../vocab/claim-status.ts';
import { KNOWABILITY_MARKS, ROUTES } from '../vocab/model.ts';
import { ActualUseId, RegimenId, Text } from '../common/ids.ts';
import { MedicationRefFields } from '../common/medication.ts';
import { EvidenceRef } from '../common/refs.ts';
import { SimTime } from '../common/sim-time.ts';

export const RegimenEntry = z
  .strictObject({
    id: RegimenId,
    ...MedicationRefFields,
    dose: Text,
    route: z.enum(ROUTES),
    frequencyText: Text,
    formulationText: Text.optional(),
    indicationText: Text.optional(),
    prescriberText: Text.optional().describe(
      'Fictional prescriber / office, as the author intends it',
    ),
    notesText: Text.optional(),
  })
  .describe('Reference regimen entry: the intended pre-admission regimen');
export type RegimenEntry = z.infer<typeof RegimenEntry>;

export const Knowability = z
  .strictObject({
    mark: z.enum(KNOWABILITY_MARKS).describe('D-MED-005 knowability mark'),
    knowableVia: z
      .array(EvidenceRef)
      .min(1)
      .optional()
      .describe(
        'Evidence units through which the fact becomes knowable (omit for irreducibly-uncertain)',
      ),
  })
  .describe('How and whether a learner can come to know this fact');

export const ActualUseEntry = z
  .strictObject({
    id: ActualUseId,
    ...MedicationRefFields,
    regimenId: RegimenId.optional().describe('The regimen entry this fact is about, if any'),
    status: z.enum(ACTUAL_USE_STATUSES).describe('What the patient was actually doing'),
    detailText: Text.describe('The authored truth, in plain words'),
    knowability: Knowability,
    lastTakenTime: SimTime.optional().describe('Last dose before T0, when known and relevant'),
  })
  .describe('Actual-use state entry: what was really happening before admission');
export type ActualUseEntry = z.infer<typeof ActualUseEntry>;
