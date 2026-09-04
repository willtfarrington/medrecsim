// SPDX-License-Identifier: MIT
/**
 * Closed vocabularies for the evidence model and the action model, each tied to its decision.
 * Values here are tokens; display labels belong to the app.
 */

/** The seven v1 evidence-source types (D-WF-001). */
export const SOURCE_TYPES = [
  'patient-interview',
  'caregiver-informant',
  'physical-artifacts',
  'imported-ehr-list',
  'prior-discharge-summary',
  'pharmacy-dispensing-history',
  'outpatient-note',
  // Parked, never implemented at v1 (D-RISK-002; final-roadmap.md B-1): claims-like feeds
  // and external-records exchange would join this list as additional source types.
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/**
 * The four scored escalation channels (D-CLIN-002). The second is labelled
 * "outpatient prescriber/program office" per the OQ-3 ruling; the token follows the label.
 */
export const ESCALATION_CHANNELS = [
  'community-pharmacy',
  'outpatient-prescriber-program-office',
  'inpatient-pharmacist',
  'senior-attending',
] as const;
export type EscalationChannel = (typeof ESCALATION_CHANNELS)[number];

/** Author-side knowability marks on actual-use facts (D-MED-005). */
export const KNOWABILITY_MARKS = [
  'initially-known',
  'conditionally-discoverable',
  'inferable',
  'irreducibly-uncertain',
] as const;
export type KnowabilityMark = (typeof KNOWABILITY_MARKS)[number];

/**
 * Admission-action kinds a learner can record per medication (D-MED-004: continue / hold /
 * needs-decision / escalate; D-WF-004: unable-to-verify and defer-with-plan are first-class
 * terminal states; D-PROD-002: competency 3 appears only as propose-with-rationale).
 */
export const ACTION_KINDS = [
  'continue',
  'hold',
  'needs-decision',
  'escalate',
  'propose-with-rationale',
  'unable-to-verify',
  'defer-with-plan',
] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

/** What the reference layer expects the learner to do with a discrepancy at signature. */
export const RESOLUTION_EXPECTATIONS = [
  'resolve-with-rationale',
  'escalate',
  'unable-to-verify',
  'defer-with-plan',
] as const;
export type ResolutionExpectation = (typeof RESOLUTION_EXPECTATIONS)[number];

/** Per-evidence-unit yield tags for subscore 1 (clinical-model §4.1). */
export const YIELD_TAGS = ['critical', 'corroborating', 'low-yield'] as const;
export type YieldTag = (typeof YIELD_TAGS)[number];

/** Difficulty tiers (D-TAX-004). */
export const TIERS = ['introductory', 'core', 'advanced'] as const;
export type Tier = (typeof TIERS)[number];

/** Review status of a bundle at validation time (see INV-META-001). */
export const REVIEW_STATUSES = ['draft-unreviewed', 'reviewed'] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** Fixed review-model string (REVIEW-RECORD-TEMPLATE.md §1; CLAIMS.md row C3). */
export const REVIEW_MODEL = 'physician-reviewed (single reviewer)' as const;

/** Reference-layer scoring state per item (D-RISK-004 contestable-scoring freeze). */
export const SCORING_STATES = ['scored', 'discussion-item-not-scored'] as const;
export type ScoringState = (typeof SCORING_STATES)[number];

/**
 * Sanctioned reasons for the unresolved-label escape hatch (tension T-2). A claim may name a
 * medication without a formulary id only for one of these reasons, and INV-REF-001 requires
 * the flag to be explicit so escapes stay countable.
 */
export const UNRESOLVED_LABEL_REASONS = [
  'patient-description-only',
  'illegible-or-partial-label',
  'non-formulary-product',
  'informant-cannot-name',
] as const;
export type UnresolvedLabelReason = (typeof UNRESOLVED_LABEL_REASONS)[number];

/** Routes of administration used in claims and regimens. */
export const ROUTES = [
  'oral',
  'sublingual',
  'buccal',
  'topical',
  'transdermal',
  'inhaled',
  'intranasal',
  'ophthalmic',
  'otic',
  'subcutaneous',
  'intramuscular',
  'intravenous',
  'rectal',
  'vaginal',
  'other',
] as const;
export type Route = (typeof ROUTES)[number];

/** Kinds of evidence unit an evidence reference string can point at (see common/refs). */
export const EVIDENCE_REF_KINDS = [
  'source',
  'claim',
  'allergy-claim',
  'dialogue-node',
  'artifact',
  'escalation-channel',
] as const;
export type EvidenceRefKind = (typeof EVIDENCE_REF_KINDS)[number];
