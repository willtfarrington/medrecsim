// SPDX-License-Identifier: MIT
/**
 * Per-source claim-status vocabulary (D-MED-001), adopted verbatim at schema v0.1. The
 * decision text delegates refinement "vs AHRQ/ISMP definitions" to the schema epic; EP-9
 * keeps the eleven tokens unchanged and documents operational meanings in the authoring
 * guide (content/AUTHORING.md §4). A token change is a clinical-semantics change and an
 * owner decision (D-EXEC-003).
 *
 * `taking-differently` requires the claim to say how (`howTakingDifferently`) — checked by
 * INV-SHAPE-001, mirrored (not enforced) by the schema's description.
 */
export const CLAIM_STATUSES = [
  'prescribed',
  'dispensed',
  'taking-as-directed',
  'taking-differently',
  'held-by-clinician',
  'self-discontinued',
  'stopped-by-clinician',
  'course-completed',
  'restarted',
  'never-started',
  'unknown-to-source',
] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

/**
 * Actual-use status in the reference layer: the same vocabulary minus `unknown-to-source`
 * (that token describes a *source's* knowledge; the reference layer expresses author
 * uncertainty through knowability marks instead — D-MED-005).
 */
export const ACTUAL_USE_STATUSES = CLAIM_STATUSES.filter((s) => s !== 'unknown-to-source') as [
  Exclude<ClaimStatus, 'unknown-to-source'>,
  ...Exclude<ClaimStatus, 'unknown-to-source'>[],
];
export type ActualUseStatus = Exclude<ClaimStatus, 'unknown-to-source'>;
