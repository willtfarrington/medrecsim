// SPDX-License-Identifier: MIT
/**
 * Review-badge text (EP-10 component spec; D-RISK-003; REVIEW-RECORD-TEMPLATE.md §2). Pure:
 * the viewing date is passed in, so the engine-side rule "no wall clock" and the golden tests
 * both hold. The rendered surface (pre-brief, picker) arrives with EP-15/EP-19 and consumes
 * this helper; docs/design/COMPONENT-SPECS.md §2 is the contract.
 */
import { REVIEW_MODEL } from '@medrecsim/schema/vocab';

/** The `preBriefBadge` block of case.yaml, copied from the review record (INV-META-001). */
export interface ReviewBadgeFields {
  label: typeof REVIEW_MODEL;
  recordVersion: number;
  reviewDate: string; // ISO YYYY-MM-DD
  staleAfter: string; // ISO YYYY-MM-DD = reReview.dueBy
}

export interface ReviewBadge {
  /** Full text, e.g. "physician-reviewed (single reviewer) · record v1 · reviewed 2026-11-15". */
  text: string;
  /** Parts in render order, so a surface can mark up each span without re-parsing the text. */
  parts: readonly string[];
  /** True when the viewing date is past staleAfter (amber state; "re-review due" appended). */
  stale: boolean;
  /** Accessible name for the badge as a whole (same words, one string). */
  ariaLabel: string;
}

export const STALE_SUFFIX = 're-review due';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * @param fields  the badge block from case.yaml
 * @param viewingDate ISO date (YYYY-MM-DD) of the viewer's local calendar day; the caller
 *   derives it from the browser clock in the app adapter, never inside engine code.
 */
export function reviewBadge(fields: ReviewBadgeFields, viewingDate: string): ReviewBadge {
  if (fields.label !== REVIEW_MODEL)
    throw new Error(`review badge label must be "${REVIEW_MODEL}" (CLAIMS.md C3)`);
  for (const [k, v] of [
    ['reviewDate', fields.reviewDate],
    ['staleAfter', fields.staleAfter],
    ['viewingDate', viewingDate],
  ] as const)
    if (!ISO_DATE.test(v)) throw new Error(`${k} must be an ISO date (YYYY-MM-DD): ${v}`);
  // ISO calendar dates compare correctly as strings.
  const stale = viewingDate > fields.staleAfter;
  const parts = [
    fields.label,
    `record v${fields.recordVersion}`,
    `reviewed ${fields.reviewDate}`,
    ...(stale ? [STALE_SUFFIX] : []),
  ];
  const text = parts.join(' · ');
  return { text, parts, stale, ariaLabel: text };
}
