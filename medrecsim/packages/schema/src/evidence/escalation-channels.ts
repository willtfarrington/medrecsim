// SPDX-License-Identifier: MIT
/**
 * Escalation channels (D-CLIN-002; OQ-3 relabel): authored availability window, latency,
 * response content, and what happens when nobody answers. Time-critical medications interact
 * with these deterministically through the clock (D-WF-002).
 */
import { z } from 'zod';
import { ESCALATION_CHANNELS } from '../vocab/model.ts';
import {
  AllergyClaimId,
  ClaimId,
  EscalationChannelId,
  InstitutionId,
  Text,
} from '../common/ids.ts';
import { ClockTime } from '../common/sim-time.ts';

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export const AvailabilityWindow = z
  .discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('always') }),
    z.strictObject({
      kind: z.literal('hours'),
      opens: ClockTime,
      closes: ClockTime,
      days: z.array(z.enum(WEEKDAYS)).min(1).optional().describe('Omit for every day'),
    }),
  ])
  .describe('When the channel answers');

export const UnansweredBehavior = z
  .discriminatedUnion('kind', [
    z.strictObject({
      kind: z.literal('voicemail-callback'),
      callbackLatencyMinutes: z.number().int().positive(),
    }),
    z.strictObject({
      kind: z.literal('retry-later'),
      retryAfterMinutes: z.number().int().positive(),
    }),
    z.strictObject({ kind: z.literal('closed-until-window') }),
  ])
  .describe('What happens when the channel is called outside its window or is busy');

export const EscalationChannelDef = z
  .strictObject({
    id: EscalationChannelId,
    channel: z.enum(ESCALATION_CHANNELS).describe('One of the four scored channels'),
    label: Text.describe('Label the learner sees, e.g. the fictional pharmacy name'),
    institutionId: InstitutionId.optional(),
    availabilityWindow: AvailabilityWindow,
    latencyMinutes: z.number().int().nonnegative().describe('Clock cost until a response arrives'),
    responseContent: z.strictObject({
      text: Text.describe('Authored response, in the responder’s voice'),
      revealsClaimIds: z.array(ClaimId).default([]),
      revealsAllergyClaimIds: z.array(AllergyClaimId).default([]),
    }),
    unansweredBehavior: UnansweredBehavior,
  })
  .describe('Escalation channel (evidence layer)');
export type EscalationChannelDef = z.infer<typeof EscalationChannelDef>;
