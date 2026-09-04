// SPDX-License-Identifier: MIT
/**
 * `evidence.yaml` — the learner-observable layer (D-MED-005). This module and everything it
 * imports compile inside the evidence-only TypeScript project (tsconfig.evidence.json), which
 * cannot reach src/reference/: that is the type-level half of INV-TRUTH-001.
 */
import { z } from 'zod';
import { CaseId } from '../common/ids.ts';
import { AbsoluteTime } from '../common/sim-time.ts';
import { SchemaVersionStamp } from '../common/versions.ts';
import { Patient } from './patient.ts';
import { Source } from './sources.ts';
import { Claim } from './claims.ts';
import { AllergyClaim } from './allergy-claims.ts';
import { DialogueTree } from './dialogue.ts';
import { Artifact } from './artifacts.ts';
import { EscalationChannelDef } from './escalation-channels.ts';

export const EvidenceDocument = z
  .strictObject({
    schemaVersion: SchemaVersionStamp,
    caseId: CaseId,
    patient: Patient,
    T0: AbsoluteTime.describe(
      'Admission anchor; all relative SimTimes resolve against it (D-MED-002)',
    ),
    sources: z.array(Source).min(1),
    claims: z.array(Claim).min(1),
    allergyClaims: z.array(AllergyClaim).default([]),
    dialogueTrees: z.array(DialogueTree).default([]),
    artifacts: z.array(Artifact).default([]),
    escalationChannels: z.array(EscalationChannelDef).default([]),
  })
  .describe('evidence.yaml — learner-observable evidence layer');
export type EvidenceDocument = z.infer<typeof EvidenceDocument>;
export type EvidenceInput = z.input<typeof EvidenceDocument>;

/** Top-level keys of the evidence document (used by INV-TRUTH-001 attribution). */
export const EVIDENCE_TOP_LEVEL_KEYS = Object.keys(EvidenceDocument.shape);
