// SPDX-License-Identifier: MIT
// Provisions the pnpm that package.json#packageManager pins, without Corepack (EP-11b;
// docs/DEPENDENCY-POLICY.md §5.4 and §8; ADR-4 addendum). Node 25 and later ship no Corepack,
// and pnpm's own version switch does not check the pinned hash, so this script is the one path
// by which pnpm reaches CI or a contributor's machine:
//   1. read `pnpm@<version>+sha512.<hex>` from package.json#packageManager, the single source of
//      the version and the hash;
//   2. download that version's tarball from the public npm registry (policy §5.3);
//   3. refuse, installing nothing, unless its SHA-512 equals the pinned hash;
//   4. install the verified file with the npm that ships with this Node, lifecycle scripts
//      ignored, and check that the `pnpm` found on PATH reports the pinned version.
// Usage (from medrecsim/): node scripts/provision-pnpm.mjs [--beside-node | --prefix <dir>]
//   (no flag)       npm's global folder; on Windows, by default, %APPDATA%\npm.
//   --beside-node   the folder of the running node binary, where Corepack used to put its shims
//                   and which actions/setup-node puts first on PATH (CI uses this).
//   --prefix <dir>  under <dir>, without the PATH check (trials in a scratch folder).
import { execFileSync, execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const REGISTRY = 'https://registry.npmjs.org';

function fail(message) {
  console.error(`provision-pnpm: ${message}`);
  process.exit(1);
}

const USAGE = 'usage: provision-pnpm.mjs [--beside-node | --prefix <dir>]';
const args = process.argv.slice(2);
let prefix; // undefined: npm's own global prefix
let checkPath = true;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--prefix' && args[i + 1] && prefix === undefined) {
    prefix = resolve(args[++i]);
    checkPath = false;
  } else if (args[i] === '--beside-node' && prefix === undefined) {
    // npm puts global bins in <prefix> on Windows and in <prefix>/bin elsewhere.
    const nodeDir = dirname(process.execPath);
    prefix = process.platform === 'win32' ? nodeDir : dirname(nodeDir);
  } else {
    fail(`unexpected argument "${args[i]}" (${USAGE})`);
  }
}

const manifestPath = join(import.meta.dirname, '..', 'package.json');
const { packageManager } = JSON.parse(readFileSync(manifestPath, 'utf8'));
const pin = /^pnpm@(\d+\.\d+\.\d+)\+sha512\.([0-9a-f]{128})$/.exec(packageManager ?? '');
if (!pin) {
  fail(
    `package.json#packageManager must read pnpm@<x.y.z>+sha512.<128 hex digits>, not "${packageManager}"`,
  );
}
const [, version, pinnedHash] = pin;

// 1–3. Download and verify before anything is written.
const url = `${REGISTRY}/pnpm/-/pnpm-${version}.tgz`;
const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
if (!response.ok) fail(`GET ${url} returned HTTP ${response.status}; nothing was installed.`);
const tarball = Buffer.from(await response.arrayBuffer());
const downloadedHash = createHash('sha512').update(tarball).digest('hex');
if (downloadedHash !== pinnedHash) {
  fail(
    `SHA-512 mismatch for ${url}\n  pinned:     ${pinnedHash}\n  downloaded: ${downloadedHash}\nNothing was installed.`,
  );
}
console.log(`provision-pnpm: pnpm ${version} downloaded; SHA-512 matches packageManager.`);

// 4. Install with the npm bundled beside this Node: no shell, so no PATH lookup for npm itself.
const npmCli = [
  join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'), // Windows layout
  join(dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'), // POSIX
].find((candidate) => existsSync(candidate));
if (!npmCli) fail(`no npm found beside ${process.execPath}; nothing was installed.`);

const workDir = mkdtempSync(join(tmpdir(), 'provision-pnpm-'));
let installed = false;
try {
  const file = join(workDir, `pnpm-${version}.tgz`);
  writeFileSync(file, tarball);
  const npmArgs = ['install', '--global', '--ignore-scripts', '--no-audit', '--no-fund'];
  if (prefix) npmArgs.push('--prefix', prefix);
  execFileSync(process.execPath, [npmCli, ...npmArgs, file], { stdio: 'inherit' });
  installed = true;
} catch {
  // npm has printed its own error above.
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
if (!installed) {
  fail(
    'npm could not install the verified tarball (its error is above). If it reports EEXIST for ' +
      "pnpm or pnpx files that Corepack left in npm's global folder, remove those files and run " +
      'this script again.',
  );
}

if (!checkPath) {
  console.log(`provision-pnpm: pnpm ${version} installed under ${prefix} (PATH not checked).`);
} else {
  let onPath = '';
  try {
    // A constant command through the shell: `pnpm` resolves the way a user's or a CI step's
    // would (pnpm.cmd on Windows needs a shell). It runs outside the workspace, so the
    // project's own pnpm settings play no part in the answer.
    onPath = execSync('pnpm --version', { cwd: tmpdir(), encoding: 'utf8' }).trim();
  } catch {
    fail('the installed pnpm does not run from PATH; is its folder on PATH?');
  }
  if (onPath !== version) {
    fail(`the pnpm first on PATH reports ${onPath}, not ${version}; another pnpm comes first.`);
  }
  console.log(`provision-pnpm: pnpm ${version} installed and first on PATH.`);
}
