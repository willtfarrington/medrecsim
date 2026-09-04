// SPDX-License-Identifier: MIT
/**
 * Attribution of schema (shape) errors to invariant ids. Many invariants are partly enforced
 * by the Zod schema itself (a missing `urgency` is a schema error), so a negative fixture that
 * violates INV-DISC-001 must still be rejected *by name*. This table maps an issue's file and
 * data path to the invariant that owns the rule; anything unclaimed reports as `SCHEMA`.
 */
import type { z } from 'zod';
import { REFERENCE_TOP_LEVEL_KEYS } from '../reference/document.ts';
import { finding, type Finding, type PathSegment } from './types.ts';

const TIME_FIELDS = new Set(['eventTime', 'documentationTime']);
const REF_FIELDS = new Set(['formularyId', 'unresolvedLabel', 'sanctioned', 'reason']);
const DISC_FIELDS = new Set([
  'type',
  'mechanism',
  'secondaryMechanisms',
  'detectabilityPaths',
  'detectability',
  'requires',
  'urgency',
  'severity',
  'reversibility',
  'timeToHarm',
]);
const META_CASE_FIELDS = new Set([
  'tier',
  'coverage',
  'reviewStatus',
  'reviewRecordRef',
  'preBriefBadge',
  'recommendedSequenceIndex',
  'estimatedMinutes',
]);
const VERS_CASE_FIELDS = new Set([
  'contentVersion',
  'formularyVersionRange',
  'universeVersionRange',
]);

function toPath(path: readonly PropertyKey[]): PathSegment[] {
  return path.map((p) => (typeof p === 'symbol' ? String(p) : p));
}

export function attributeIssue(file: string, issue: z.core.$ZodIssue): string {
  const path = toPath(issue.path);
  const first = path[0];
  const last = path[path.length - 1];
  if (first === 'schemaVersion') return 'INV-VERS-001';

  if (file === 'evidence.yaml') {
    if (issue.code === 'unrecognized_keys' && path.length === 0) {
      const keys = (issue as { keys?: string[] }).keys ?? [];
      if (keys.some((k) => REFERENCE_TOP_LEVEL_KEYS.includes(k))) return 'INV-TRUTH-001';
    }
    if (typeof last === 'string' && TIME_FIELDS.has(last)) return 'INV-TIME-001';
    if (first === 'T0') return 'INV-TIME-001';
    if (typeof last === 'string' && REF_FIELDS.has(last)) return 'INV-REF-001';
    if (last === 'renderText') return 'INV-A11Y-001';
    if (first === 'patient' && last === 'chartId') return 'INV-SCOPE-001';
    return 'SCHEMA';
  }

  if (file === 'reference.yaml') {
    if (first === 'discrepancies') {
      const field = path[2];
      if (typeof field === 'string' && DISC_FIELDS.has(field)) return 'INV-DISC-001';
      if (path.length === 2 && issue.code === 'invalid_type') return 'INV-DISC-001';
    }
    if (first === 'actionSets') return 'INV-ACT-001';
    if (first === 'hints') return 'INV-HINT-001';
    if (typeof last === 'string' && REF_FIELDS.has(last)) return 'INV-REF-001';
    if (typeof last === 'string' && TIME_FIELDS.has(last)) return 'INV-TIME-001';
    return 'SCHEMA';
  }

  if (file === 'case.yaml') {
    if (typeof first === 'string' && META_CASE_FIELDS.has(first)) return 'INV-META-001';
    if (typeof first === 'string' && VERS_CASE_FIELDS.has(first)) return 'INV-VERS-001';
    if (first === 'preBrief' && path[1] === 'syntheticNotice') return 'INV-SCOPE-001';
    return 'SCHEMA';
  }

  if (file === 'review-record.yaml') return 'INV-META-001';
  if (file === 'citations.yaml') return 'INV-CIT-001';

  if (file.startsWith('entries/') || file === 'formulary.yaml') {
    if (last === 'pillAppearanceText') return 'INV-A11Y-001';
    if (first === 'brandNamesFictional') return 'INV-SCOPE-001';
    if (typeof last === 'string' && REF_FIELDS.has(last)) return 'INV-REF-001';
    return 'SCHEMA';
  }

  return 'SCHEMA';
}

/** Convert a Zod failure into attributed findings. */
export function findingsFromZodError(file: string, error: z.ZodError): Finding[] {
  return error.issues.map((issue) =>
    finding(attributeIssue(file, issue), 'error', file, toPath(issue.path), issue.message),
  );
}
