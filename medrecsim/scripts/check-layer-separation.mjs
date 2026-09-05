// SPDX-License-Identifier: MIT
// Two-layer truth/action contract at the type level (D-MED-005; INV-TRUTH-001).
// For each guarded package:
//  (a) its evidence-only composite project must compile clean — the learner-observable side
//      reaches nothing in packages/schema/src/reference/;
//  (b) its layer-fixture project — the same file list plus layer-fixtures/, where a module on
//      the evidence side imports a reference type — must FAIL with TS6307 naming a
//      src/reference/ file. If a fixture ever compiles, that boundary is gone.
// Guarded packages: schema (EP-9 item 3: the evidence layer itself) and engine (EP-11: the
// engine core, whose pre-signature views cannot name a reference-layer type).
// Usage: node scripts/check-layer-separation.mjs
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const tsc = resolve(root, 'node_modules/typescript/lib/tsc.js');

const GUARDED = [
  {
    label: 'schema evidence layer (EP-9)',
    clean: 'packages/schema/tsconfig.evidence.json',
    fixture: 'packages/schema/tsconfig.layer-fixture.json',
  },
  {
    label: 'engine core / pre-signature views (EP-11)',
    clean: 'packages/engine/tsconfig.evidence.json',
    fixture: 'packages/engine/tsconfig.layer-fixture.json',
  },
];

function run(project) {
  const r = spawnSync(process.execPath, [tsc, '-p', project], { cwd: root, encoding: 'utf8' });
  return { status: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const failures = [];
const passes = [];

for (const g of GUARDED) {
  const clean = run(g.clean);
  if (clean.status !== 0)
    failures.push(`${g.label}: evidence-only project does not compile:\n${clean.out.trim()}`);

  const fixture = run(g.fixture);
  if (fixture.status === 0)
    failures.push(
      `${g.label}: layer fixture COMPILED — the evidence side can reach src/reference/ (D-MED-005 broken)`,
    );
  else if (!/TS6307/.test(fixture.out) || !/src\/reference\//.test(fixture.out))
    failures.push(
      `${g.label}: layer fixture failed for the wrong reason (expected TS6307 naming src/reference/):\n${fixture.out.trim()}`,
    );
  else passes.push(g.label);
}

if (failures.length > 0) {
  console.error('Layer-separation check FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  `Layer-separation check PASS (${passes.join('; ')}): each evidence-only project compiles; each fixture that imports a reference type fails with TS6307.`,
);
