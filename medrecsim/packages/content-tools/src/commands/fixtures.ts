// SPDX-License-Identifier: MIT
/**
 * `fixtures [--format …]` — the negative-fixture suite (EP-9 item 5). Each fixture under
 * tests/synthetic-fixtures/negative/<name>/fixture.yaml declares mutations applied to a copy of
 * the exemplar bundle and the invariant that must reject the result *by name*. The unmodified
 * exemplar is the positive control and must produce zero errors.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  validateCaseBundle,
  type ContentFile,
  type Finding,
  type PathSegment,
} from '@medrecsim/schema';
import { loadSharedPackages } from '../context.ts';
import { expectedSpdxFor, loadCaseBundle } from '../load.ts';
import type { Format } from '../report.ts';
import type { Paths } from '../workspace.ts';

interface Mutation {
  file: string;
  op: 'set' | 'delete' | 'strip-header-lines' | 'set-file' | 'delete-file';
  path?: string;
  value?: unknown;
  lines?: number;
  data?: unknown;
}

interface FixtureSpec {
  name: string;
  expect: { invariant: string; severity?: 'error' | 'warning' };
  mutations: Mutation[];
}

export interface FixtureResult {
  name: string;
  expected: string;
  ok: boolean;
  matched: Finding[];
  detail: string;
}

function parsePath(path: string): PathSegment[] {
  const out: PathSegment[] = [];
  for (const m of path.matchAll(/([^.[\]]+)|\[(\d+)\]/g)) {
    if (m[2] !== undefined) out.push(Number(m[2]));
    else if (m[1] !== undefined) out.push(m[1]);
  }
  return out;
}

function setIn(root: unknown, path: readonly PathSegment[], value: unknown): void {
  let cur = root as Record<PropertyKey, unknown>;
  for (let i = 0; i < path.length - 1; i++)
    cur = cur[path[i] as PropertyKey] as Record<PropertyKey, unknown>;
  cur[path[path.length - 1] as PropertyKey] = value;
}

function deleteIn(root: unknown, path: readonly PathSegment[]): void {
  let cur = root as Record<PropertyKey, unknown>;
  for (let i = 0; i < path.length - 1; i++)
    cur = cur[path[i] as PropertyKey] as Record<PropertyKey, unknown>;
  const last = path[path.length - 1];
  if (Array.isArray(cur) && typeof last === 'number') cur.splice(last, 1);
  else delete cur[last as PropertyKey];
}

export function applyMutations(
  files: Map<string, ContentFile>,
  mutations: readonly Mutation[],
  spdx: string,
): void {
  for (const m of mutations) {
    const existing = files.get(m.file);
    switch (m.op) {
      case 'set':
      case 'delete': {
        if (!existing || m.path === undefined)
          throw new Error(`mutation ${m.op} needs an existing file and a path`);
        const data = structuredClone(existing.data);
        if (m.op === 'set') setIn(data, parsePath(m.path), m.value);
        else deleteIn(data, parsePath(m.path));
        files.set(m.file, { ...existing, data });
        break;
      }
      case 'strip-header-lines': {
        if (!existing) throw new Error(`mutation strip-header-lines needs an existing file`);
        const text = existing.text
          .split('\n')
          .slice(m.lines ?? 1)
          .join('\n');
        files.set(m.file, { ...existing, text });
        break;
      }
      case 'set-file': {
        const text = `# SPDX-License-Identifier: ${spdx}\n${stringifyYaml(m.data)}`;
        files.set(m.file, {
          name: m.file,
          path: `<fixture>/${m.file}`,
          text,
          data: structuredClone(m.data),
        });
        break;
      }
      case 'delete-file':
        files.delete(m.file);
        break;
      default:
        throw new Error(`unknown mutation op ${(m as Mutation).op}`);
    }
  }
}

export function runFixtures(
  paths: Paths,
  format: Format,
  exemplarDir = join(paths.casesDir, '_exemplar'),
): { output: string; ok: boolean; results: FixtureResult[] } {
  const shared = loadSharedPackages(paths);
  const negativeDir = join(paths.fixturesDir, 'negative');
  const results: FixtureResult[] = [];
  const lines: string[] = [];

  const base = loadCaseBundle(exemplarDir, paths);
  const spdx = expectedSpdxFor(exemplarDir, paths);
  const ctx = { ...shared.ctx, expectedSpdx: spdx };
  const control = validateCaseBundle(base.input, ctx);
  const controlErrors = control.findings.filter((f) => f.severity === 'error');
  const controlOk = controlErrors.length === 0;
  results.push({
    name: '(positive control: unmodified exemplar)',
    expected: 'no errors',
    ok: controlOk,
    matched: controlErrors,
    detail: controlOk
      ? 'clean'
      : controlErrors.map((f) => `${f.invariant} ${f.file} ${f.message}`).join('; '),
  });

  const fixtureDirs = existsSync(negativeDir)
    ? readdirSync(negativeDir)
        .sort()
        .map((d) => join(negativeDir, d))
        .filter((d) => statSync(d).isDirectory() && existsSync(join(d, 'fixture.yaml')))
    : [];
  for (const dir of fixtureDirs) {
    const spec = parseYaml(readFileSync(join(dir, 'fixture.yaml'), 'utf8')) as FixtureSpec;
    const files = new Map<string, ContentFile>();
    for (const [k, v] of base.input.files) files.set(k, { ...v, data: structuredClone(v.data) });
    applyMutations(files, spec.mutations, spdx);
    const r = validateCaseBundle({ ...base.input, files }, ctx);
    const severity = spec.expect.severity ?? 'error';
    const matched = r.findings.filter(
      (f) => f.invariant === spec.expect.invariant && f.severity === severity,
    );
    const ok = matched.length > 0;
    results.push({
      name: spec.name,
      expected: `${spec.expect.invariant} (${severity})`,
      ok,
      matched,
      detail: ok
        ? matched.map((f) => `${f.file}: ${f.message}`).join(' | ')
        : `no ${severity} from ${spec.expect.invariant}; got: ${r.findings.map((f) => `${f.invariant}/${f.severity}`).join(', ') || 'nothing'}`,
    });
  }

  const failed = results.filter((r) => !r.ok);
  if (format === 'json') {
    return { output: JSON.stringify({ results }, null, 2), ok: failed.length === 0, results };
  }
  for (const r of results) {
    if (format === 'github') {
      lines.push(
        r.ok
          ? `fixture ${r.name}: rejected by ${r.expected}`
          : `::error title=fixture ${r.name}::expected ${r.expected} — ${r.detail}`,
      );
    } else {
      lines.push(
        `${r.ok ? 'PASS' : 'FAIL'} ${r.name.padEnd(48)} ${r.ok ? `rejected by ${r.expected}` : r.detail}`,
      );
      if (r.ok && format === 'pretty') lines.push(`       ${r.detail}`);
    }
  }
  lines.push(
    `fixtures: ${results.length - 1} negative fixture(s) + positive control; ${failed.length} failure(s)`,
  );
  return { output: lines.join('\n'), ok: failed.length === 0, results };
}
