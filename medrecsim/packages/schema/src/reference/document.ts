// SPDX-License-Identifier: MIT
/** `reference.yaml` — the author-only reference layer (D-MED-005). */
import { z } from 'zod';
import { YIELD_TAGS } from '../vocab/model.ts';
import { CaseId } from '../common/ids.ts';
import { EvidenceRef } from '../common/refs.ts';
import { SchemaVersionStamp } from '../common/versions.ts';
import { ActualUseEntry, RegimenEntry } from './regimen.ts';
import { Discrepancy } from './discrepancies.ts';
import { ActionSets } from './action-sets.ts';
import { ExpectedEscalation, Hint, TeachingNoteRef } from './escalations-hints-teaching.ts';

export const EvidenceYield = z
  .strictObject({
    ref: EvidenceRef,
    yield: z.enum(YIELD_TAGS),
  })
  .describe('Per-evidence-unit yield tag for subscore 1 (clinical-model §4.1)');

export const ReferenceDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    caseId: CaseId,
    referenceRegimen: z.array(RegimenEntry).min(1),
    actualUseState: z.array(ActualUseEntry).min(1),
    evidenceYield: z.array(EvidenceYield).optional(),
    discrepancies: z.array(Discrepancy).min(1),
    actionSets: ActionSets,
    expectedEscalations: z.array(ExpectedEscalation).default([]),
    hints: z.array(Hint).default([]),
    teachingNoteRefs: z.array(TeachingNoteRef).default([]),
    // The debrief timeline is computed from the engine event log, never authored here.
  })
  .describe('reference.yaml — author-only reference layer');
export type ReferenceDocument = z.infer<typeof ReferenceDocument>;
export type ReferenceInput = z.input<typeof ReferenceDocument>;

/** Top-level reference keys — their presence in evidence.yaml is an INV-TRUTH-001 failure. */
export const REFERENCE_TOP_LEVEL_KEYS = Object.keys(ReferenceDocument.shape).filter(
  (k) => k !== 'schemaVersion' && k !== 'caseId',
);
