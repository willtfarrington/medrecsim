// SPDX-License-Identifier: MIT
/**
 * INV-TRUTH-001 compile-error fixture at the engine seam (EP-11).
 *
 * Stands in for a view-side (pre-signature) module that tries to name a reference-layer type.
 * Compiled through tsconfig.layer-fixture.json (the engine's evidence-only composite project
 * plus this directory) it MUST fail with TS6307, because packages/schema/src/reference/** is
 * outside that project's file list. scripts/check-layer-separation.mjs asserts that exact
 * failure and, separately, that tsconfig.evidence.json compiles clean. If this file ever
 * compiles, a pre-signature view can reach the reference layer (D-MED-005 broken).
 */
import type { Discrepancy } from '@medrecsim/schema/reference';
import type { SessionView } from '../src/core/view.ts';

export type LeakedView = SessionView & { readonly truth: Discrepancy };
