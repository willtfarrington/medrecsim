// SPDX-License-Identifier: MIT
/**
 * `schema-export [--check]` — writes the draft-07 JSON Schemas generated from the Zod source
 * (ADR-2) to packages/schema/json-schema/, plus an index the editor mapping reads. `--check`
 * regenerates in memory and fails on any drift (CI).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SCHEMA_VERSION, exportJsonSchemas } from '@medrecsim/schema';
import type { Paths } from '../workspace.ts';

function serialize(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n';
}

export function runSchemaExport(paths: Paths, check: boolean): { output: string; ok: boolean } {
  const dir = paths.jsonSchemaDir;
  const exported = exportJsonSchemas();
  const files = new Map<string, string>();
  for (const e of exported) files.set(`${e.name}.schema.json`, serialize(e.schema));
  files.set(
    'index.json',
    serialize({
      schemaVersion: SCHEMA_VERSION,
      generatedBy: 'pnpm schema:export (packages/content-tools; ADR-2)',
      schemas: exported.map((e) => ({
        name: e.name,
        file: `${e.name}.schema.json`,
        fileMatch: e.fileMatch,
      })),
    }),
  );

  if (check) {
    const drift: string[] = [];
    for (const [name, content] of files) {
      const p = join(dir, name);
      if (!existsSync(p)) drift.push(`${name}: missing`);
      else if (readFileSync(p, 'utf8') !== content)
        drift.push(`${name}: differs from the Zod source`);
    }
    if (existsSync(dir))
      for (const f of readdirSync(dir))
        if (f.endsWith('.json') && !files.has(f)) drift.push(`${f}: stale (no longer exported)`);
    if (drift.length > 0)
      return {
        output: `schema-export --check FAILED (run pnpm schema:export and commit):\n  - ${drift.join('\n  - ')}`,
        ok: false,
      };
    return { output: `schema-export --check PASS: ${files.size} files current`, ok: true };
  }

  mkdirSync(dir, { recursive: true });
  for (const [name, content] of files) writeFileSync(join(dir, name), content, 'utf8');
  return { output: `schema-export: wrote ${files.size} files to ${dir}`, ok: true };
}
