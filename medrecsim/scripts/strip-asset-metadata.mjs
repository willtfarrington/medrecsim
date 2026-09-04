#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Asset-hygiene entry point for CI and the pre-commit hook (EP-10 item 7; D-UX-006;
// docs/ORIGINALITY-CHECKLIST.md §6). Thin wrapper over the content CLI's `assets` command so
// the hook can run it with a plain `node` and no package-manager step.
//   node scripts/strip-asset-metadata.mjs --check [files or dirs]   (default: repo asset paths)
//   node scripts/strip-asset-metadata.mjs --fix   [files or dirs]
// Exit 0 clean · 1 metadata found (check) · 2 usage.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const rest = args.filter((a) => a !== '--fix' && a !== '--check');
const cli = join(import.meta.dirname, '..', 'packages', 'content-tools', 'src', 'cli.ts');
const r = spawnSync(
  process.execPath,
  [
    cli,
    'assets',
    ...(fix ? ['--fix'] : []),
    ...rest,
    ...(process.env.GITHUB_ACTIONS ? ['--format', 'github'] : []),
  ],
  { stdio: 'inherit' },
);
process.exit(r.status ?? 2);
