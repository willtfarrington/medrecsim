// SPDX-License-Identifier: MIT
/**
 * Test support: the compiled exemplar scaffold as the engine's fixture bundle. The fixture is
 * never hand-copied — it is compiled from `content/cases/_exemplar` through the content CLI
 * (`compile --include-drafts`, ADR-3) at test time, so it can never drift from the schema.
 * Every clinical string in it is `PLACEHOLDER — not reviewed` (EP-9); the engine tests care
 * about structure and mechanics only. Excluded from the engine's platform-free tsconfig.
 */
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runCompile } from '@medrecsim/content-tools/src/commands/compile.ts';
import { resolvePaths } from '@medrecsim/content-tools/src/workspace.ts';
import { loadCompiledCase, type CompiledCase } from '../case-loader.ts';

export const EXEMPLAR_CASE_ID = 'c00-exemplar-scaffold';

let cached: unknown = null;

/** The compiled chunk for the exemplar scaffold (memoised per test file). */
export function exemplarChunk(): unknown {
  if (cached !== null) return cached;
  const paths = resolvePaths();
  const out = mkdtempSync(join(tmpdir(), 'medrecsim-engine-fixture-'));
  try {
    const r = runCompile(paths, { out, includeDrafts: true, format: 'pretty' });
    if (!r.ok) throw new Error(`exemplar did not compile:\n${r.output}`);
    cached = JSON.parse(readFileSync(join(out, 'cases', `${EXEMPLAR_CASE_ID}.json`), 'utf8'));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
  return cached;
}

/** A fresh, loaded copy of the exemplar (deep-cloned so tests may mutate it). */
export function exemplarCase(): CompiledCase {
  return loadCompiledCase(structuredClone(exemplarChunk()));
}
