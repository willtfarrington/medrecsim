// SPDX-License-Identifier: MIT
/**
 * `assets [--fix] [<file-or-dir>...]` — asset hygiene in the content pipeline (EP-10 item 7;
 * D-UX-006). Without arguments it scans the repository's asset paths; with arguments it scans
 * those files or directories. Check mode (default) lists every file that still carries
 * metadata and exits 1; `--fix` rewrites them in place. Runs in CI (`pnpm check:assets`) and
 * in the pre-commit hook (`scripts/strip-asset-metadata.mjs --check <staged files>`).
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { ASSET_EXTENSIONS, stripAsset } from '../asset-hygiene.ts';
import type { Format } from '../report.ts';
import { toPosix, type Paths } from '../workspace.ts';

export interface AssetsOptions {
  fix: boolean;
  /** Files or directories; empty = the default repository asset paths. */
  targets: readonly string[];
  format: Format;
}

export interface AssetFileResult {
  file: string;
  removed: string[];
  fixed: boolean;
}

/** Where assets may live (repository-relative). Missing directories are skipped. */
export function defaultAssetRoots(paths: Paths): string[] {
  return [
    join(paths.workspace, 'content'),
    join(paths.workspace, 'packages', 'app', 'src', 'assets'),
    join(paths.workspace, 'packages', 'app', 'public'),
    join(paths.repo, 'docs'),
    join(paths.repo, '.github'),
  ];
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git']);
const EXT = new Set<string>(ASSET_EXTENSIONS);

function walk(p: string, out: string[]): void {
  const st = statSync(p, { throwIfNoEntry: false });
  if (!st) return;
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) if (!SKIP_DIRS.has(e)) walk(join(p, e), out);
  } else if (EXT.has(extname(p).toLowerCase())) out.push(p);
}

export function runAssets(
  paths: Paths,
  opts: AssetsOptions,
): { output: string; ok: boolean; results: AssetFileResult[] } {
  const roots =
    opts.targets.length > 0 ? opts.targets.map((t) => resolve(t)) : defaultAssetRoots(paths);
  const files: string[] = [];
  for (const r of roots) if (existsSync(r)) walk(r, files);
  files.sort();

  const results: AssetFileResult[] = [];
  for (const file of files) {
    const bytes = new Uint8Array(readFileSync(file));
    const outcome = stripAsset(file, bytes);
    if (!outcome) continue;
    let fixed = false;
    if (outcome.removed.length > 0 && opts.fix) {
      writeFileSync(file, outcome.data);
      fixed = true;
    }
    results.push({ file: toPosix(relative(paths.repo, file)), removed: outcome.removed, fixed });
  }
  const dirty = results.filter((r) => r.removed.length > 0 && !r.fixed);
  const ok = dirty.length === 0;

  if (opts.format === 'json')
    return { output: JSON.stringify({ ok, files: results }, null, 2), ok, results };

  const lines: string[] = [];
  for (const r of results) {
    if (r.removed.length === 0) continue;
    const what = r.removed.join(', ');
    if (r.fixed) lines.push(`fixed ${r.file}: removed ${what}`);
    else if (opts.format === 'github')
      lines.push(
        `::error file=${r.file},title=asset hygiene::carries metadata (${what}); run pnpm content assets --fix`,
      );
    else lines.push(`DIRTY ${r.file}: ${what}`);
  }
  lines.push(
    ok
      ? `asset hygiene PASS: ${results.length} asset file(s) scanned, none carry metadata${opts.fix ? '' : ''}`
      : `asset hygiene FAILED: ${dirty.length} of ${results.length} file(s) carry metadata — run \`pnpm content assets --fix <path>\` (or the script with --fix) and re-stage`,
  );
  return { output: lines.join('\n'), ok, results };
}
