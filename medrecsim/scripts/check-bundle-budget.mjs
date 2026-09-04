// SPDX-License-Identifier: MIT
// Bundle-budget check (D-ARCH-007): the initial JavaScript served by index.html must be
// ≤ 300 KB gzipped. "Initial" = every <script src> and <link rel="modulepreload"> in the built
// index.html; lazily imported chunks (case content) are listed but not counted.
// Usage: node scripts/check-bundle-budget.mjs [dist-dir]   (env BUNDLE_BUDGET_BYTES overrides)
import { readdirSync, readFileSync, statSync, appendFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const BUDGET = Number(process.env.BUNDLE_BUDGET_BYTES ?? 300 * 1024);
const dist = resolve(process.argv[2] ?? join(import.meta.dirname, '../packages/app/dist'));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const html = readFileSync(join(dist, 'index.html'), 'utf8');
const initial = new Set();
for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) initial.add(m[1]);
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g))
  initial.add(m[1]);
const normalise = (href) => href.replace(/^\.\//, '').replace(/^\//, '');
const initialSet = new Set([...initial].map(normalise));

const rows = walk(dist)
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const rel = relative(dist, f).replaceAll('\\', '/');
    const buf = readFileSync(f);
    return {
      file: rel,
      raw: buf.length,
      gz: gzipSync(buf, { level: 9 }).length,
      initial: initialSet.has(rel),
    };
  })
  .sort((a, b) => Number(b.initial) - Number(a.initial) || b.gz - a.gz);

const initialGz = rows.filter((r) => r.initial).reduce((a, r) => a + r.gz, 0);
const pct = ((initialGz / BUDGET) * 100).toFixed(1);
const ok = initialGz <= BUDGET;

const table = [
  '| File | Raw bytes | Gzip bytes | Initial |',
  '|---|---:|---:|:---:|',
  ...rows.map(
    (r) =>
      `| ${r.file} | ${r.raw.toLocaleString('en-US')} | ${r.gz.toLocaleString('en-US')} | ${r.initial ? 'yes' : 'lazy'} |`,
  ),
  '',
  `**Initial JS: ${initialGz.toLocaleString('en-US')} B gzipped = ${pct} % of the ${BUDGET.toLocaleString('en-US')} B budget → ${ok ? 'PASS' : 'FAIL'}**`,
].join('\n');

console.log(table);
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## Bundle budget\n\n${table}\n`);
}
if (!ok) {
  console.error(`\nBundle budget exceeded: ${initialGz} B > ${BUDGET} B (D-ARCH-007).`);
  process.exit(1);
}
