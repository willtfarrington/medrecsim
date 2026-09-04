// SPDX-License-Identifier: MIT
// SPDX header check (D-OSS-001, CLAIMS.md row C8, RELEASE-CRITERIA gate G6).
// Code under packages/*/src, scripts/, tests/ must declare MIT; content under content/ must
// declare CC-BY-4.0. The identifier must appear within the first three lines.
// Usage: node scripts/check-spdx.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const RULES = [
  { dir: 'packages', match: (rel) => /^packages\/[^/]+\/src\//.test(rel), id: 'MIT' },
  { dir: 'scripts', match: (rel) => rel.startsWith('scripts/'), id: 'MIT' },
  { dir: 'tests', match: (rel) => rel.startsWith('tests/'), id: 'MIT' },
  { dir: 'content', match: (rel) => rel.startsWith('content/'), id: 'CC-BY-4.0' },
];
const CHECKED_EXT = new Set([
  '.ts',
  '.js',
  '.mjs',
  '.cjs',
  '.svelte',
  '.css',
  '.yaml',
  '.yml',
  '.md',
]);

function walk(dir, out = []) {
  if (!statSync(dir, { throwIfNoEntry: false })) return out;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const failures = [];
let checked = 0;
for (const rule of RULES) {
  for (const file of walk(join(root, rule.dir))) {
    const rel = relative(root, file).replaceAll('\\', '/');
    if (!rule.match(rel) || !CHECKED_EXT.has(extname(file))) continue;
    checked++;
    const head = readFileSync(file, 'utf8').split(/\r?\n/, 3).join('\n');
    const m = /SPDX-License-Identifier:\s*([A-Za-z0-9.+-]+)/.exec(head);
    if (!m) failures.push(`${rel}: missing SPDX-License-Identifier header (expected ${rule.id})`);
    else if (m[1] !== rule.id)
      failures.push(`${rel}: SPDX identifier ${m[1]} but ${rule.id} expected`);
  }
}

if (failures.length > 0) {
  console.error('SPDX check FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`SPDX check PASS: ${checked} files carry the expected identifier.`);
