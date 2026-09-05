// SPDX-License-Identifier: MIT
/**
 * `compile [--out <dir>] [--include-drafts]` — YAML → JSON chunks (ADR-3). Validates first and
 * writes nothing on error. Relative SimTimes are resolved to absolute UTC ISO instants
 * (tension T-1), so the runtime never parses YAML or relative time syntax.
 *
 * Output (default packages/app/src/content/generated/, gitignored — a build artifact):
 *   index.json           — manifest of compiled cases + package versions
 *   formulary.json       — manifest + entries (placeholders excluded unless --include-drafts)
 *   universe.json
 *   cases/<case-id>.json — { compiledFrom, caseLocalUtcOffsetMinutes, case, evidence, reference,
 *                          citations, reviewRecord }
 *
 * `caseLocalUtcOffsetMinutes` is derived from the offset the author wrote on `T0` (schema
 * AbsoluteTime always carries one). Every instant in the chunk is UTC; the engine needs the
 * case-local offset to evaluate escalation availability windows (authored as local HH:MM and
 * weekdays, D-CLIN-002) against the simulated clock (EP-11). One fixed offset per case.
 *
 * Draft bundles (directory name starting with `_`, or reviewStatus draft-unreviewed) are
 * excluded unless --include-drafts.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import {
  SCHEMA_VERSION,
  TAXONOMY_VERSION,
  resolveSimTime,
  toCompiledIso,
  validateCaseBundle,
  type ParsedCaseBundle,
} from '@medrecsim/schema';
import { fileReportPath, loadSharedPackages } from '../context.ts';
import { expectedSpdxFor, listCaseDirs, loadCaseBundle } from '../load.ts';
import { annotate, countBySeverity, render, type BundleReport, type Format } from '../report.ts';
import { toPosix, type Paths } from '../workspace.ts';

export interface CompileOptions {
  out?: string | undefined;
  includeDrafts: boolean;
  format: Format;
}

function resolveTimes(bundle: ParsedCaseBundle): ParsedCaseBundle {
  const t0 = bundle.evidence.T0;
  const abs = (v: string) => {
    const d = resolveSimTime(v, t0);
    if (!d) throw new Error(`unresolvable time ${v}`);
    return toCompiledIso(d);
  };
  const absOpt = (v: string | undefined) => (v === undefined ? undefined : abs(v));
  const out = structuredClone(bundle);
  out.evidence.T0 = abs(t0);
  for (const s of out.evidence.sources)
    if (s.availableFrom !== undefined) s.availableFrom = abs(s.availableFrom);
  for (const c of out.evidence.claims) {
    c.eventTime = abs(c.eventTime);
    c.documentationTime = abs(c.documentationTime);
  }
  for (const a of out.evidence.allergyClaims) {
    a.eventTime = abs(a.eventTime);
    a.documentationTime = abs(a.documentationTime);
  }
  for (const u of out.reference.actualUseState) {
    const v = absOpt(u.lastTakenTime);
    if (v !== undefined) u.lastTakenTime = v;
  }
  for (const x of out.reference.expectedEscalations) {
    const v = absOpt(x.byTime);
    if (v !== undefined) x.byTime = v;
  }
  return out;
}

/** UTC offset in minutes carried by an ISO-8601 date-time (`Z` → 0, `-05:00` → -300). */
export function utcOffsetMinutesOf(isoWithOffset: string): number {
  const m = /(?:Z|([+-])(\d{2}):?(\d{2}))$/.exec(isoWithOffset);
  if (!m || m[1] === undefined) return 0;
  const sign = m[1] === '-' ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3]));
}

function writeJson(path: string, value: unknown): void {
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

export function runCompile(paths: Paths, opts: CompileOptions): { output: string; ok: boolean } {
  const outDir = opts.out ? resolve(opts.out) : paths.compiledDir;
  const shared = loadSharedPackages(paths);
  const reports: BundleReport[] = [...shared.reports];
  const compiled: { dir: string; bundle: ParsedCaseBundle; draft: boolean }[] = [];
  for (const dir of listCaseDirs(paths)) {
    const loaded = loadCaseBundle(dir, paths);
    const r = validateCaseBundle(loaded.input, {
      ...shared.ctx,
      expectedSpdx: expectedSpdxFor(dir, paths),
    });
    reports.push({
      dir: loaded.input.dir,
      findings: annotate(r.findings, loaded.lines, (n) => fileReportPath(loaded.input.dir, n)),
    });
    if (r.parsed) {
      const draft =
        basename(dir).startsWith('_') || r.parsed.case.reviewStatus === 'draft-unreviewed';
      compiled.push({ dir: loaded.input.dir, bundle: r.parsed, draft });
    }
  }
  const { errors } = countBySeverity(reports);
  const lines: string[] = [];
  if (errors > 0 || !shared.parsedFormulary || !shared.parsedUniverse) {
    lines.push(render(opts.format, reports, 'compile (validation)'));
    if (!shared.parsedFormulary) lines.push('compile: formulary package missing or invalid');
    if (!shared.parsedUniverse) lines.push('compile: universe package missing or invalid');
    lines.push('compile: nothing written');
    return { output: lines.join('\n'), ok: false };
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(join(outDir, 'cases'), { recursive: true });
  const { manifest, entries } = shared.parsedFormulary;
  const shippedEntries = entries.filter((e) => opts.includeDrafts || !e.placeholder);
  writeJson(join(outDir, 'formulary.json'), { ...manifest, entries: shippedEntries });
  writeJson(join(outDir, 'universe.json'), shared.parsedUniverse.document);
  const index: Record<string, unknown>[] = [];
  let skipped = 0;
  for (const { dir, bundle, draft } of compiled) {
    if (draft && !opts.includeDrafts) {
      skipped++;
      continue;
    }
    const resolved = resolveTimes(bundle);
    const file = `cases/${bundle.case.id}.json`;
    writeJson(join(outDir, file), {
      compiledFrom: dir,
      caseLocalUtcOffsetMinutes: utcOffsetMinutesOf(bundle.evidence.T0),
      ...resolved,
    });
    index.push({
      id: bundle.case.id,
      slug: bundle.case.slug,
      title: bundle.case.title,
      tier: bundle.case.tier,
      recommendedSequenceIndex: bundle.case.recommendedSequenceIndex,
      estimatedMinutes: bundle.case.estimatedMinutes,
      contentVersion: bundle.case.contentVersion,
      reviewStatus: bundle.case.reviewStatus,
      preBriefBadge: bundle.case.preBriefBadge ?? null,
      draft,
      chunk: file,
    });
  }
  index.sort(
    (a, b) => (a.recommendedSequenceIndex as number) - (b.recommendedSequenceIndex as number),
  );
  writeJson(join(outDir, 'index.json'), {
    schemaVersion: SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    formularyVersion: manifest.formularyVersion,
    universeVersion: shared.parsedUniverse.document.universeVersion,
    cases: index,
  });
  lines.push(
    `compile: wrote ${index.length} case chunk(s), ${shippedEntries.length} formulary entr${shippedEntries.length === 1 ? 'y' : 'ies'}, universe → ${toPosix(outDir)}${skipped > 0 ? ` (${skipped} draft bundle(s) skipped; --include-drafts to include)` : ''}`,
  );
  return { output: lines.join('\n'), ok: true };
}
