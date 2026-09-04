// SPDX-License-Identifier: MIT
// Developer Certificate of Origin check (CONTRIBUTING.md; D-OSS-002). Every non-merge commit in
// the given revision range must carry a `Signed-off-by: Name <email>` trailer. No third-party
// app: a few lines over `git log`.
// Usage: node scripts/check-dco.mjs <rev-range>   e.g. origin/main..HEAD
import { execFileSync } from 'node:child_process';

const range = process.argv[2];
if (!range) {
  console.error('Usage: node scripts/check-dco.mjs <rev-range>');
  process.exit(2);
}

const raw = execFileSync(
  'git',
  ['log', '--no-merges', '--format=%H%x1f%an%x1f%ae%x1f%B%x1e', range],
  {
    encoding: 'utf8',
  },
);
const commits = raw
  .split('\x1e')
  .map((c) => c.trim())
  .filter(Boolean)
  .map((c) => {
    const [sha, name, email, body] = c.split('\x1f');
    return { sha, name, email, body: body ?? '' };
  });

const TRAILER = /^Signed-off-by:\s*.+\s<[^<>@\s]+@[^<>\s]+>\s*$/m;
const missing = commits.filter((c) => !TRAILER.test(c.body));

console.log(`DCO: ${commits.length} commit(s) in ${range}`);
for (const c of missing) {
  const subject = c.body.split('\n')[0];
  console.error(`  ✗ ${c.sha.slice(0, 7)} ${subject} — no Signed-off-by trailer`);
}
if (missing.length > 0) {
  console.error(
    `\n${missing.length} commit(s) lack a Signed-off-by line. Sign off with \`git commit -s\` (or ` +
      '`git rebase --signoff`) certifying the DCO 1.1 reproduced in CONTRIBUTING.md.',
  );
  process.exit(1);
}
console.log('DCO check PASS.');
