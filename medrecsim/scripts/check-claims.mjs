// SPDX-License-Identifier: MIT
// Claims hygiene in CI (docs/CLAIMS.md, docs/RELEASE-CRITERIA.md per-tag checklist item 2):
//  (a) copy rule — outward copy never says "expert-reviewed" except on a line that also says
//      "never" (a rule statement);
//  (b) the standing-disclaimer block is byte-identical in every consumer: docs/CLAIMS.md
//      (canonical), README.md, and the app's disclaimer.json.
// Usage: node scripts/check-claims.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const repo = resolve(import.meta.dirname, '../..');

// Outward-copy path list from CLAIMS.md ("Outward copy" definition), handoffs excluded.
const OUTWARD = [
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'SUPPORT.md',
  'CODE_OF_CONDUCT.md',
  'THIRD-PARTY.md',
  'CITATION.cff',
  'CHANGELOG.md',
  'LICENSE-CONTENT.md',
  '.github',
  'docs',
  'source material',
  'medrecsim',
];
const EXCLUDE = [/^docs\/handoffs\//, /(^|\/)node_modules\//, /(^|\/)dist\//, /pnpm-lock\.yaml$/];

function walk(p, out = []) {
  const st = statSync(p, { throwIfNoEntry: false });
  if (!st) return out;
  if (st.isDirectory()) for (const e of readdirSync(p)) walk(join(p, e), out);
  else out.push(p);
  return out;
}

const failures = [];

// (a) copy rule
for (const entry of OUTWARD) {
  for (const file of walk(join(repo, entry))) {
    const rel = relative(repo, file).replaceAll('\\', '/');
    if (EXCLUDE.some((re) => re.test(rel))) continue;
    if (!/\.(md|cff|yml|yaml|json|ts|svelte|js|mjs|html|css|txt)$/.test(file)) continue;
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      if (/expert-reviewed/i.test(line) && !/never/i.test(line)) {
        failures.push(
          `${rel}:${i + 1}: copy rule — never "expert-reviewed" outside a rule statement (CLAIMS C3)`,
        );
      }
    });
  }
}

// (b) disclaimer block
function blockFrom(markdown, label) {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('> Educational use only.'));
  if (start < 0) {
    failures.push(`${label}: standing-disclaimer block not found`);
    return null;
  }
  const out = [];
  for (let i = start; i < lines.length && lines[i].startsWith('> '); i++)
    out.push(lines[i].slice(2).trim());
  return out.join(' ');
}
const canonical = blockFrom(readFileSync(join(repo, 'docs/CLAIMS.md'), 'utf8'), 'docs/CLAIMS.md');
const readme = blockFrom(readFileSync(join(repo, 'README.md'), 'utf8'), 'README.md');
const app = JSON.parse(
  readFileSync(join(repo, 'medrecsim/packages/app/src/disclaimer.json'), 'utf8'),
).text;
if (canonical && readme !== canonical)
  failures.push('README.md: disclaimer block differs from docs/CLAIMS.md');
if (canonical && app !== canonical)
  failures.push(
    'medrecsim/packages/app/src/disclaimer.json: disclaimer differs from docs/CLAIMS.md',
  );

if (failures.length > 0) {
  console.error('Claims check FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  'Claims check PASS: copy rule clean; disclaimer block identical in CLAIMS.md, README.md, and the app.',
);
