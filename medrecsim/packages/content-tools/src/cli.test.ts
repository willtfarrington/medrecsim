// SPDX-License-Identifier: MIT
/**
 * End-to-end tests over the real content tree: the exemplar validates, every shipped invariant
 * has a negative fixture that rejects by name, the JSON Schema export is current, and compile
 * resolves relative times to absolute instants.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { SHIPPED_INVARIANTS } from '@medrecsim/schema';
import { runCompile } from './commands/compile.ts';
import { runFixtures } from './commands/fixtures.ts';
import { runSchemaExport } from './commands/schema-export.ts';
import { runValidate } from './commands/validate.ts';
import { resolvePaths } from './workspace.ts';

const paths = resolvePaths();
const tmp = mkdtempSync(join(tmpdir(), 'medrecsim-compile-'));
afterAll(() => rmSync(tmp, { recursive: true, force: true }));

describe('validate --all', () => {
  const r = runValidate(paths, { all: true, dirs: [], format: 'json' });
  it('is green on the exemplar scaffold, formulary and universe', () => {
    expect(r.ok, r.output).toBe(true);
  });
  it('reports the draft/placeholder warnings by name', () => {
    const json = JSON.parse(r.output) as {
      bundles: { findings: { invariant: string; severity: string; message: string }[] }[];
    };
    const warnings = json.bundles
      .flatMap((b) => b.findings)
      .filter((f) => f.severity === 'warning');
    expect(
      warnings.some((w) => w.invariant === 'INV-META-001' && /unreviewed draft/.test(w.message)),
    ).toBe(true);
    expect(
      warnings.some(
        (w) => w.invariant === 'INV-META-001' && /placeholder formulary entry/.test(w.message),
      ),
    ).toBe(true);
  });
});

describe('negative fixture suite', () => {
  const r = runFixtures(paths, 'json');
  it('every fixture is rejected by its named invariant and the positive control is clean', () => {
    expect(r.ok, r.output).toBe(true);
  });
  it('every shipped invariant has at least one negative fixture', () => {
    const negativeDir = join(paths.fixturesDir, 'negative');
    const expected = new Set(
      readdirSync(negativeDir).map(
        (d) =>
          (
            parseYaml(readFileSync(join(negativeDir, d, 'fixture.yaml'), 'utf8')) as {
              expect: { invariant: string };
            }
          ).expect.invariant,
      ),
    );
    for (const inv of SHIPPED_INVARIANTS)
      expect(expected.has(inv), `no fixture for ${inv}`).toBe(true);
  });
  it('every fixture file starts with the # SYNTHETIC header', () => {
    const negativeDir = join(paths.fixturesDir, 'negative');
    for (const d of readdirSync(negativeDir))
      expect(
        readFileSync(join(negativeDir, d, 'fixture.yaml'), 'utf8').startsWith('# SYNTHETIC\n'),
      ).toBe(true);
  });
});

describe('schema-export --check', () => {
  it('committed JSON Schemas match the Zod source', () => {
    const r = runSchemaExport(paths, true);
    expect(r.ok, r.output).toBe(true);
  });
});

describe('compile (ADR-3, T-1)', () => {
  it('skips draft bundles by default and writes package chunks', () => {
    const r = runCompile(paths, { out: join(tmp, 'a'), includeDrafts: false, format: 'json' });
    expect(r.ok, r.output).toBe(true);
    const index = JSON.parse(readFileSync(join(tmp, 'a', 'index.json'), 'utf8')) as {
      cases: unknown[];
      schemaVersion: string;
    };
    expect(index.cases).toEqual([]);
    expect(index.schemaVersion).toBe('0.1');
    expect(existsSync(join(tmp, 'a', 'formulary.json'))).toBe(true);
    expect(existsSync(join(tmp, 'a', 'universe.json'))).toBe(true);
  });
  it('with --include-drafts compiles the exemplar with absolute UTC times', () => {
    const r = runCompile(paths, { out: join(tmp, 'b'), includeDrafts: true, format: 'json' });
    expect(r.ok, r.output).toBe(true);
    const chunk = JSON.parse(
      readFileSync(join(tmp, 'b', 'cases', 'c00-exemplar-scaffold.json'), 'utf8'),
    ) as {
      evidence: { T0: string; claims: { eventTime: string; documentationTime: string }[] };
    };
    expect(chunk.evidence.T0).toBe('2026-01-15T19:30:00Z');
    for (const c of chunk.evidence.claims) {
      expect(c.eventTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(Date.parse(c.documentationTime)).toBeGreaterThanOrEqual(Date.parse(c.eventTime));
    }
    const text = readFileSync(join(tmp, 'b', 'cases', 'c00-exemplar-scaffold.json'), 'utf8');
    expect(text).not.toMatch(/"T0[+-]/);
  });
});

describe('CLI process', () => {
  const cli = join(paths.workspace, 'packages', 'content-tools', 'src', 'cli.ts');
  const run = (...args: string[]) =>
    spawnSync(process.execPath, [cli, ...args], { cwd: paths.workspace, encoding: 'utf8' });
  it('usage exits 2; validate --all exits 0; --format github emits annotations for warnings', () => {
    expect(run().status).toBe(2);
    const v = run('validate', '--all', '--format', 'github');
    expect(v.status, v.stdout + v.stderr).toBe(0);
    expect(v.stdout).toMatch(/^::warning file=medrecsim\/content\/.*,title=INV-META-001::/m);
  });
  it('validate exits 1 on a broken bundle', () => {
    const v = run('validate', join(paths.workspace, 'content'));
    expect(v.status).toBe(1);
  });
});
