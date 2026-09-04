// SPDX-License-Identifier: MIT
/** `validate [--all] [<bundle-dir>...] [--format pretty|json|github]` — exit 1 on any error. */
import { resolve } from 'node:path';
import { validateCaseBundle } from '@medrecsim/schema';
import { fileReportPath, loadSharedPackages } from '../context.ts';
import { expectedSpdxFor, listCaseDirs, loadCaseBundle } from '../load.ts';
import { annotate, countBySeverity, render, type BundleReport, type Format } from '../report.ts';
import type { Paths } from '../workspace.ts';

export interface ValidateOptions {
  all: boolean;
  dirs: string[];
  format: Format;
}

export function runValidate(
  paths: Paths,
  opts: ValidateOptions,
): { output: string; ok: boolean; reports: BundleReport[] } {
  const shared = loadSharedPackages(paths);
  const reports: BundleReport[] = [...shared.reports];
  const dirs = opts.all ? listCaseDirs(paths) : opts.dirs.map((d) => resolve(d));
  for (const dir of dirs) {
    const loaded = loadCaseBundle(dir, paths);
    const ctx = { ...shared.ctx, expectedSpdx: expectedSpdxFor(dir, paths) };
    const r = validateCaseBundle(loaded.input, ctx);
    reports.push({
      dir: loaded.input.dir,
      findings: annotate(r.findings, loaded.lines, (n) => fileReportPath(loaded.input.dir, n)),
    });
  }
  const { errors } = countBySeverity(reports);
  return { output: render(opts.format, reports, 'validate'), ok: errors === 0, reports };
}
