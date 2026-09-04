// SPDX-License-Identifier: MIT
// Regenerates the runtime section of ../THIRD-PARTY.md from the lockfile (DEPENDENCY-POLICY.md
// §6.9; RELEASE-CRITERIA.md per-tag checklist item 5, gate G6). The runtime closure is every
// production dependency reachable from @medrecsim/app (workspace packages excluded); each row
// carries the package's declared licence and its licence text is appended verbatim.
// Everything outside the marker comments in THIRD-PARTY.md is hand-maintained and preserved.
// Usage: node scripts/gen-third-party.mjs [--check]   (--check: fail if the file would change)
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const workspace = resolve(import.meta.dirname, '..');
const target = resolve(workspace, '../THIRD-PARTY.md');
const check = process.argv.includes('--check');
const BEGIN = '<!-- BEGIN GENERATED: runtime dependencies (scripts/gen-third-party.mjs) -->';
const END = '<!-- END GENERATED: runtime dependencies -->';

// Fixed command string (no user input) so it runs through the shell on every platform.
const listing = JSON.parse(
  execSync('pnpm list --filter @medrecsim/app --prod --depth Infinity --json', {
    cwd: workspace,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }),
);

const packages = new Map();
function visit(deps) {
  for (const [name, info] of Object.entries(deps ?? {})) {
    if (name.startsWith('@medrecsim/')) {
      visit(info.dependencies);
      continue;
    }
    const key = `${name}@${info.version}`;
    if (!packages.has(key)) packages.set(key, { name, version: info.version, path: info.path });
    visit(info.dependencies);
  }
}
for (const project of listing) visit(project.dependencies);

function licenceOf(pkgDir) {
  const manifest = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));
  const declared =
    typeof manifest.license === 'string' ? manifest.license : (manifest.license?.type ?? 'UNKNOWN');
  const file = readdirSync(pkgDir).find((f) => /^(licen[cs]e|copying)(\.|$)/i.test(f));
  const text = file ? readFileSync(join(pkgDir, file), 'utf8').trim() : null;
  return { declared, homepage: manifest.homepage ?? manifest.repository?.url ?? '', text, file };
}

// Which packages actually ship: written by the app's build (vite.config.ts bundleManifest plugin).
const manifestPath = join(workspace, 'packages/app/dist/bundle-manifest.json');
const bundled = existsSync(manifestPath)
  ? new Set(JSON.parse(readFileSync(manifestPath, 'utf8')).bundledPackages)
  : null;
if (!bundled)
  console.warn(
    'warning: no dist/bundle-manifest.json (run `pnpm build` first); "Bundled" column left blank.',
  );

const rows = [...packages.values()]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((p) => ({ ...p, ...licenceOf(p.path), bundled: bundled ? bundled.has(p.name) : null }));

const generated = [
  BEGIN,
  `Generated ${new Date().toISOString().slice(0, 10)} from \`medrecsim/pnpm-lock.yaml\` — the production dependency closure of \`@medrecsim/app\` (${rows.length} package${rows.length === 1 ? '' : 's'}). "Bundled" marks packages whose code is present in the built application (from the build's \`bundle-manifest.json\`); the others are compile-time dependencies of a runtime package and are listed for completeness.`,
  '',
  '| Package | Version | Licence | Bundled | Source |',
  '|---|---|---|:---:|---|',
  ...rows.map(
    (r) =>
      `| ${r.name} | ${r.version} | ${r.declared} | ${r.bundled === null ? '' : r.bundled ? 'yes' : 'no'} | ${r.homepage} |`,
  ),
  '',
  '### Licence texts',
  '',
  ...rows.flatMap((r) => [
    `#### ${r.name} ${r.version} (${r.declared})`,
    '',
    '```',
    r.text ?? `(no licence file shipped in the package; declared licence: ${r.declared})`,
    '```',
    '',
  ]),
  END,
].join('\n');

const current = existsSync(target) ? readFileSync(target, 'utf8') : '';
const b = current.indexOf(BEGIN);
const e = current.indexOf(END);
if (b < 0 || e < 0) {
  console.error(`THIRD-PARTY.md must contain the marker comments:\n${BEGIN}\n${END}`);
  process.exit(2);
}
const next = current.slice(0, b) + generated + current.slice(e + END.length);
if (check) {
  if (next !== current) {
    console.error('THIRD-PARTY.md is out of date; run `pnpm notices`.');
    process.exit(1);
  }
  console.log('THIRD-PARTY.md is current.');
} else {
  writeFileSync(target, next);
  console.log(`THIRD-PARTY.md regenerated: ${rows.length} runtime package(s).`);
}
