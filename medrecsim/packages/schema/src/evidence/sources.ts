// SPDX-License-Identifier: MIT
/** The seven evidence sources (D-WF-001) with availability and information-seeking cost. */
import { z } from 'zod';
import { SOURCE_TYPES } from '../vocab/model.ts';
import { InstitutionId, SourceId, Text } from '../common/ids.ts';
import { SimTime } from '../common/sim-time.ts';

export const SOURCE_AVAILABILITIES = ['immediate', 'on-request', 'time-gated'] as const;

export const Source = z
  .strictObject({
    id: SourceId,
    type: z.enum(SOURCE_TYPES).describe('One of the seven D-WF-001 source types'),
    label: Text.describe('Chart-tab / channel label the learner sees'),
    descriptionText: Text.describe('What this source is, in the source voice (EP-22 renders)'),
    institutionId: InstitutionId.optional().describe('Fictional-universe institution (I-9)'),
    availability: z
      .enum(SOURCE_AVAILABILITIES)
      .describe('immediate = open at T0; on-request = costs a request; time-gated = availableFrom'),
    availableFrom: SimTime.optional().describe('Required when availability is time-gated'),
    accessCostMinutes: z
      .number()
      .int()
      .nonnegative()
      .describe('Simulated minutes the clock advances when the source is opened (D-WF-002)'),
    reliabilityNoteText: Text.optional().describe(
      'Learner-visible caveat about the source (e.g. "imported list last reconciled two years ago")',
    ),
  })
  .describe('Evidence source');
export type Source = z.infer<typeof Source>;
