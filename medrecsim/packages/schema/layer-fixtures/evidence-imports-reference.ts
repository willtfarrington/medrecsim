// SPDX-License-Identifier: MIT
/**
 * INV-TRUTH-001 compile-error fixture (EP-9 item 3).
 *
 * This file stands in for an evidence-layer module that tries to reach the reference layer.
 * Compiled through tsconfig.layer-fixture.json (the evidence-only composite project plus this
 * directory) it MUST fail with TS6307 ("File ... is not listed within the file list of
 * project"), because src/reference/** is outside the evidence project's file list. The check
 * in scripts/check-layer-separation.mjs asserts that exact failure and, separately, that
 * tsconfig.evidence.json compiles clean. If this file ever compiles, the two-layer contract
 * (D-MED-005) has been broken at the type level.
 */
import type { Discrepancy } from '../src/reference/discrepancies.ts';
import type { Claim } from '../src/evidence/claims.ts';

export type LeakedClaim = Claim & { truth: Discrepancy };
