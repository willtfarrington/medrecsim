// SPDX-License-Identifier: MIT
// Two-layer truth/action contract at the type level (D-MED-005; INV-TRUTH-001; EP-9 item 3).
//  (a) packages/schema/tsconfig.evidence.json — the evidence-only composite project — must
//      compile clean: the learner-observable layer reaches nothing in src/reference/.
//  (b) packages/schema/tsconfig.layer-fixture.json — the same file list plus layer-fixtures/,
//      where an evidence-side module imports a reference type — must FAIL with TS6307 naming a
//      src/reference/ file. If it ever compiles, the boundary is gone.
// Usage: node scripts/check-layer-separation.mjs
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const tsc = resolve(root, 'node_modules/typescript/lib/tsc.js');

function run(project) {
  const r = spawnSync(process.execPath, [tsc, '-p', project], { cwd: root, encoding: 'utf8' });
  return { status: r.status ?? 1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

const failures = [];

const clean = run('packages/schema/tsconfig.evidence.json');
if (clean.status !== 0)
  failures.push(`evidence-only project does not compile:\n${clean.out.trim()}`);

const fixture = run('packages/schema/tsconfig.layer-fixture.json');
if (fixture.status === 0)
  failures.push(
    'layer fixture COMPILED — the evidence layer can reach src/reference/ (D-MED-005 broken)',
  );
else if (!/TS6307/.test(fixture.out) || !/src\/reference\//.test(fixture.out))
  failures.push(
    `layer fixture failed for the wrong reason (expected TS6307 naming src/reference/):\n${fixture.out.trim()}`,
  );

if (failures.length > 0) {
  console.error('Layer-separation check FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(
  'Layer-separation check PASS: evidence-only project compiles; the fixture that imports a reference type fails with TS6307.',
);
