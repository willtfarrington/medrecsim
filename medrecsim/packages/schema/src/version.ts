// SPDX-License-Identifier: MIT
/**
 * Content-schema version stream (D-DATA-002; architecture §9).
 *
 * - `major` — the app supports exactly one major; a major bump ships with an in-repo codemod
 *   that migrates every bundle in the same change (EP-34 exercises the runner).
 * - `minor` — additive only (new optional fields, new enum values that no existing bundle
 *   needs). Bundles are re-stamped in the same change; INV-VERS-001 fails CI while any stamp
 *   lags, so the streams can never drift silently.
 *
 * Every content file carries `schemaVersion: "<major>.<minor>"`. The three version streams
 * (app semver, this constant, per-bundle `contentVersion`) are independent by decision.
 */
export const SCHEMA_MAJOR = 0;
export const SCHEMA_MINOR = 1;
export const SCHEMA_VERSION = `${SCHEMA_MAJOR}.${SCHEMA_MINOR}` as const;

/** Taxonomy instrument version whose §8 enum export this package encodes verbatim (EP-7). */
export const TAXONOMY_VERSION = '1.0' as const;

/** Review-record instrument version whose YAML shape this package encodes (EP-6). */
export const REVIEW_RECORD_TEMPLATE_VERSION = '1.0' as const;

/** Citation-policy instrument version whose ten-key record this package encodes (EP-6). */
export const CITATION_POLICY_VERSION = '1.0' as const;
