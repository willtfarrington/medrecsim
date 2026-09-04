// SPDX-License-Identifier: MIT
/**
 * @medrecsim/schema — content schema v0.1 (EP-9).
 *
 * Zod 4 schemas are the source of truth (ADR-2); TypeScript types are inferred from them; a
 * draft-07 JSON Schema is exported for editors. The learner-observable evidence layer
 * (`./evidence`) compiles in its own TypeScript project that cannot reach `./reference`
 * (D-MED-005, INV-TRUTH-001). Cross-field and cross-file rules live in `./invariants`, never
 * in Zod refinements.
 *
 * Runtime consumers (engine, app) should import types (`import type`) or the plain constants
 * from `./vocab`; importing the Zod schemas from the app would put `zod` in the runtime
 * bundle, which is an owner-only allowlist decision (D-EXEC-003).
 */
export const SCHEMA_PACKAGE = '@medrecsim/schema';

export * from './version.ts';
export * from './vocab/index.ts';
export * from './common/index.ts';
export * from './evidence/index.ts';
export * from './reference/index.ts';
export * from './documents/index.ts';
export * from './invariants/index.ts';
export * from './json-schema.ts';
