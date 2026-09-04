// SPDX-License-Identifier: MIT
/**
 * Identifier shapes. Every id is lowercase kebab-case with a fixed prefix per entity so that a
 * bare string in an error message is self-describing, and so that INV-TRUTH-001 can scan the
 * evidence layer for reference-layer ids by prefix.
 */
import { z } from 'zod';

export const KEBAB_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const Kebab = z
  .string()
  .regex(KEBAB_RE, 'lowercase kebab-case')
  .describe('kebab-case token');

function prefixed(prefix: string, description: string) {
  return z
    .string()
    .regex(new RegExp(`^${prefix}-[a-z0-9]+(?:-[a-z0-9]+)*$`), `${prefix}-<kebab-case> id`)
    .describe(description);
}

/** Case bundle id: `c` + two digits + slug, e.g. `c01-three-lists` (REVIEW-RECORD-TEMPLATE §1). */
export const CaseId = z
  .string()
  .regex(/^c\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$/, 'cNN-<slug> case id')
  .describe('Case bundle id: c + two digits + kebab slug, e.g. c01-three-lists');

// Evidence layer (learner-observable).
export const SourceId = prefixed('src', 'Evidence source id');
export const ClaimId = prefixed('clm', 'Medication claim id');
export const AllergyClaimId = prefixed('alg', 'Allergy claim id');
export const DialogueTreeId = prefixed('dlg', 'Dialogue tree id');
export const DialogueNodeId = prefixed('q', 'Dialogue node (question) id');
export const ArtifactId = prefixed('art', 'Physical artifact id');
export const EscalationChannelId = prefixed('esc', 'Escalation channel id');

// Reference layer (author-only). INV-TRUTH-001 forbids these prefixes inside evidence text.
export const RegimenId = prefixed('reg', 'Reference regimen entry id');
export const ActualUseId = prefixed('use', 'Actual-use state entry id');
export const DiscrepancyId = prefixed('disc', 'Discrepancy id');
export const ActionEntryId = prefixed('act', 'Action-set entry id');
export const RationaleKey = prefixed('rat', 'Rationale-menu key');
export const ExpectedEscalationId = prefixed('exp', 'Expected escalation id');
export const HintId = prefixed('hint', 'Hint id');
export const TeachingNoteId = prefixed('tn', 'Teaching-note reference id');
export const REFERENCE_ID_PREFIXES = [
  'reg',
  'use',
  'disc',
  'act',
  'rat',
  'exp',
  'hint',
  'tn',
] as const;

// Shared content packages.
export const FormularyId = prefixed('rx', 'Formulary entry id (D-DATA-004)');
export const InstitutionId = prefixed('inst', 'Fictional-universe institution id (I-9)');
export const PersonId = prefixed('person', 'Fictional-universe person id (I-9)');

/** `cit-` + source slug + four-digit year (CITATION-POLICY.md §1). */
export const CitationId = z
  .string()
  .regex(/^cit-[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}$/, 'cit-<slug>-<year> citation id')
  .describe('Citation record id: cit- + short source slug + year');

/** Non-empty text. */
export const Text = z.string().min(1).describe('Non-empty text');
