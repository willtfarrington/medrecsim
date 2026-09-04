// SPDX-License-Identifier: MIT
/** Version stamps for the three streams (D-DATA-002). */
import { z } from 'zod';

/** `major.minor` content-schema stamp carried by every content file. */
export const SchemaVersionStamp = z
  .string()
  .regex(/^\d+\.\d+$/, 'major.minor')
  .describe(
    'Content-schema version stamp major.minor (must equal the schema package SCHEMA_VERSION)',
  );

/** Per-bundle / per-package semver content version. */
export const ContentVersion = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'major.minor.patch')
  .describe('Content version (semver)');

/** Simple inclusive-min / exclusive-max range over ContentVersion (no npm range grammar). */
export const ContentVersionRange = z
  .strictObject({
    min: ContentVersion.describe('Lowest acceptable version (inclusive)'),
    maxExclusive: ContentVersion.optional().describe('First unacceptable version (exclusive)'),
  })
  .describe('Content version range: min inclusive, maxExclusive optional');
export type ContentVersionRange = z.infer<typeof ContentVersionRange>;

export function compareContentVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function versionInRange(version: string, range: ContentVersionRange): boolean {
  if (compareContentVersions(version, range.min) < 0) return false;
  if (range.maxExclusive !== undefined && compareContentVersions(version, range.maxExclusive) >= 0)
    return false;
  return true;
}
