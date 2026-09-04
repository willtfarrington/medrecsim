// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { REVIEW_MODEL } from '@medrecsim/schema/vocab';
import { reviewBadge, STALE_SUFFIX } from './review-badge.ts';

const fields = {
  label: REVIEW_MODEL,
  recordVersion: 1,
  reviewDate: '2026-11-15',
  staleAfter: '2027-11-15',
};

describe('review badge (D-RISK-003; REVIEW-RECORD-TEMPLATE §2)', () => {
  it('renders the template example verbatim while current', () => {
    const b = reviewBadge(fields, '2027-01-10');
    expect(b.text).toBe('physician-reviewed (single reviewer) · record v1 · reviewed 2026-11-15');
    expect(b.stale).toBe(false);
    expect(b.parts).toHaveLength(3);
    expect(b.ariaLabel).toBe(b.text);
  });
  it('is not stale on the due date itself, and stale the day after (amber rule)', () => {
    expect(reviewBadge(fields, '2027-11-15').stale).toBe(false);
    const b = reviewBadge(fields, '2027-11-16');
    expect(b.stale).toBe(true);
    expect(b.text.endsWith(` · ${STALE_SUFFIX}`)).toBe(true);
  });
  it('refuses any other review-model wording (copy rule, CLAIMS C3)', () => {
    expect(() =>
      reviewBadge({ ...fields, label: 'pharmacist-reviewed' as never }, '2027-01-01'),
    ).toThrow(/physician-reviewed/);
  });
  it('refuses non-ISO dates', () => {
    expect(() => reviewBadge(fields, '11/16/2027')).toThrow(/ISO date/);
  });
});
