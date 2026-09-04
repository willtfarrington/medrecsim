// SPDX-License-Identifier: MIT
/**
 * Accepted / partially-accepted / unsafe action sets (D-SCOR-002) with a per-case rationale
 * menu (tension T-5: per-case, not shared) and the harm-language fields INV-ACT-001 lints
 * (D-SCOR-003). Unsafe entries carry a mechanism of harm; a default band classifies the
 * whole action space (clinical-model §4.3).
 */
import { z } from 'zod';
import { ACTION_KINDS, SCORING_STATES } from '../vocab/model.ts';
import { ActionEntryId, DiscrepancyId, RationaleKey, Text } from '../common/ids.ts';
import { CitationRefs } from '../common/citation.ts';
import { MedicationRefFields } from '../common/medication.ts';

export const ACTION_BANDS = ['accepted', 'partially-accepted', 'unsafe'] as const;

export const RationaleMenuItem = z
  .strictObject({
    key: RationaleKey,
    text: Text.describe('Justification the learner can choose (no free text in v1, D-MED-004)'),
    citations: CitationRefs.optional(),
  })
  .describe('Rationale-menu item (per case, T-5)');

const entryBase = {
  id: ActionEntryId,
  target: z
    .strictObject({
      ...MedicationRefFields,
      discrepancyId: DiscrepancyId.optional(),
    })
    .describe('The medication and/or discrepancy the action is about'),
  action: z.enum(ACTION_KINDS),
  rationaleKey: RationaleKey.optional().describe('Key into rationaleMenu (preferred)'),
  rationaleText: Text.optional().describe('Inline rationale when no menu item fits; still linted'),
  citations: CitationRefs.optional(),
  scoring: z.enum(SCORING_STATES).default('scored'),
  freezeNoteText: Text.optional(),
};

export const AcceptedEntry = z.strictObject(entryBase).describe('Accepted action');
export const PartiallyAcceptedEntry = z
  .strictObject({
    ...entryBase,
    shortfallText: Text.describe('What is missing for full credit'),
  })
  .describe('Partially accepted action');
export const UnsafeEntry = z
  .strictObject({
    ...entryBase,
    mechanismOfHarm: z
      .strictObject({
        text: Text.describe(
          'Plausible-consequence phrasing with ordinal severity; no probabilities (D-SCOR-003)',
        ),
        inevitabilityAuthored: z
          .boolean()
          .default(false)
          .describe(
            'Set true only when the author deliberately states an inevitable harm; the lint otherwise rejects "will"/"always" wording',
          ),
        citations: CitationRefs.optional(),
      })
      .describe('Mechanism of harm taught in the debrief'),
  })
  .describe('Unsafe action (never blocked in-sim; surfaced in the debrief)');

export const ActionSets = z
  .strictObject({
    defaultBandForUnlisted: z
      .enum(ACTION_BANDS)
      .describe(
        'Band for any learner action not matched by an entry, so the full action space is classified',
      ),
    rationaleMenu: z.array(RationaleMenuItem).min(1),
    accepted: z.array(AcceptedEntry).min(1),
    partiallyAccepted: z.array(PartiallyAcceptedEntry).default([]),
    unsafe: z.array(UnsafeEntry).default([]),
  })
  .describe('Action sets (D-SCOR-002)');
export type ActionSets = z.infer<typeof ActionSets>;
