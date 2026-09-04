// SPDX-License-Identifier: MIT
/**
 * Structured dialogue (D-SIM-001): authored question menus with tracked cost and order;
 * responses reveal claims. One tree per interlocutor; nodes unlock other nodes.
 */
import { z } from 'zod';
import {
  AllergyClaimId,
  ClaimId,
  DialogueNodeId,
  DialogueTreeId,
  SourceId,
  Text,
} from '../common/ids.ts';

export const INTERLOCUTORS = [
  'patient',
  'caregiver',
  'nurse',
  'inpatient-pharmacist',
  'senior-attending',
  'interpreter',
  'other',
] as const;
export const RELIABILITY_MODIFIERS = ['reliable', 'lower-reliability', 'unknown'] as const;

export const DialogueNode = z
  .strictObject({
    id: DialogueNodeId,
    entry: z.boolean().default(false).describe('Available from the start of the conversation'),
    questionText: Text,
    costMinutes: z.number().int().nonnegative().describe('Clock cost of asking (D-WF-002)'),
    responseText: Text.describe('Authored response in the interlocutor’s voice'),
    revealsClaimIds: z.array(ClaimId).default([]),
    revealsAllergyClaimIds: z.array(AllergyClaimId).default([]),
    unlocks: z.array(DialogueNodeId).default([]).describe('Follow-up nodes made available'),
    reliabilityModifier: z
      .enum(RELIABILITY_MODIFIERS)
      .optional()
      .describe('Overrides the tree baseline for this response (e.g. ad-hoc interpretation)'),
  })
  .describe('Dialogue node: one question and its authored response');

export const DialogueTree = z
  .strictObject({
    id: DialogueTreeId,
    sourceId: SourceId.describe('Interview or informant source this tree belongs to'),
    interlocutor: z.enum(INTERLOCUTORS),
    baselineReliability: z.enum(RELIABILITY_MODIFIERS),
    viaInterpreter: z
      .enum(['none', 'professional', 'ad-hoc-family'])
      .default('none')
      .describe('Interpreter channel in use for this tree (D-CONS-002)'),
    nodes: z.array(DialogueNode).min(1),
  })
  .describe('Dialogue tree');
export type DialogueTree = z.infer<typeof DialogueTree>;
