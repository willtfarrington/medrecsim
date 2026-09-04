// SPDX-License-Identifier: MIT
// Every `uses:` in .github/workflows must reference a full-length (40-hex) commit SHA with the
// human-readable tag in a trailing comment (D-SEC-001; DEPENDENCY-POLICY.md §7). Local reusable
// workflows (./.github/workflows/*.yml) are exempt because they are versioned with the repo.
// Usage: node scripts/check-action-pins.mjs
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dir = resolve(import.meta.dirname, '../../.github/workflows');
const failures = [];
let checked = 0;

for (const name of readdirSync(dir).filter((f) => /\.ya?ml$/.test(f))) {
  const lines = readFileSync(join(dir, name), 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = /^\s*-?\s*uses:\s*(['"]?)([^\s'"#]+)\1(.*)$/.exec(line);
    if (!m) return;
    const ref = m[2];
    const rest = m[3];
    if (ref.startsWith('./')) return;
    checked++;
    const pinned = /@[0-9a-f]{40}$/.test(ref);
    const commented = /#\s*v?\d/.test(rest);
    if (!pinned)
      failures.push(`${name}:${i + 1}: "${ref}" is not pinned to a full-length commit SHA`);
    else if (!commented)
      failures.push(`${name}:${i + 1}: "${ref}" lacks the human-readable tag comment (# vX.Y.Z)`);
  });
}

if (failures.length > 0) {
  console.error('Action pin check FAILED:\n' + failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log(`Action pin check PASS: ${checked} action references pinned to full-length SHAs.`);
