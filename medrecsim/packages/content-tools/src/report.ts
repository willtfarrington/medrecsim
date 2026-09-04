// SPDX-License-Identifier: MIT
/** Output formats for findings: pretty (humans), json (tools), github (workflow annotations). */
import { pathToString, type Finding } from '@medrecsim/schema';
import type { LineResolver } from './load.ts';

export type Format = 'pretty' | 'json' | 'github';

export interface ReportedFinding extends Finding {
  /** Repository-relative file path (for annotations). */
  reportPath: string;
  line: number | undefined;
}

export interface BundleReport {
  /** Repository-relative bundle directory. */
  dir: string;
  findings: ReportedFinding[];
}

export function parseFormat(value: string | undefined): Format {
  if (value === undefined) return 'pretty';
  if (value === 'pretty' || value === 'json' || value === 'github') return value;
  throw new Error(`unknown --format "${value}" (pretty | json | github)`);
}

export function annotate(
  findings: readonly Finding[],
  lines: ReadonlyMap<string, LineResolver>,
  reportPathOf: (fileName: string) => string,
): ReportedFinding[] {
  return findings.map((f) => ({
    ...f,
    reportPath: reportPathOf(f.file),
    line: lines.get(f.file)?.(f.path),
  }));
}

export function countBySeverity(reports: readonly BundleReport[]): {
  errors: number;
  warnings: number;
} {
  let errors = 0;
  let warnings = 0;
  for (const r of reports)
    for (const f of r.findings) {
      if (f.severity === 'error') errors++;
      else warnings++;
    }
  return { errors, warnings };
}

export function render(format: Format, reports: readonly BundleReport[], title: string): string {
  const { errors, warnings } = countBySeverity(reports);
  const summary = `${title}: ${reports.length} bundle(s), ${errors} error(s), ${warnings} warning(s)`;
  if (format === 'json')
    return JSON.stringify({ title, bundles: reports, errors, warnings }, null, 2);
  const out: string[] = [];
  for (const r of reports) {
    if (format === 'pretty') out.push(`== ${r.dir}${r.findings.length === 0 ? ' — clean' : ''}`);
    for (const f of r.findings) {
      const where = `${f.reportPath}${f.line !== undefined ? `:${f.line}` : ''}`;
      const path = pathToString(f.path);
      if (format === 'github') {
        const level = f.severity === 'error' ? 'error' : 'warning';
        const lineAttr = f.line !== undefined ? `,line=${f.line}` : '';
        out.push(
          `::${level} file=${f.reportPath}${lineAttr},title=${f.invariant}::${escapeGithub(`${path}: ${f.message}`)}`,
        );
      } else {
        const tag = f.severity === 'error' ? 'ERROR' : 'WARN ';
        out.push(`  ${tag} ${f.invariant.padEnd(13)} ${where}  ${path}\n        ${f.message}`);
      }
    }
  }
  out.push(summary);
  return out.join('\n');
}

function escapeGithub(s: string): string {
  return s.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}
