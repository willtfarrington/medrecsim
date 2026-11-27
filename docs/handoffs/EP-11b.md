# EP-11b handoff — Node 26 LTS: the pin, engines and pnpm without Corepack

**Status:** complete — five owner decisions ruled 2026-11-27 (see "Owner decisions"); the push
of `main` is the owner's · **Date:** 2026-11-27 · **Brief:** roadmap/EP-11b-node-26-lts.md ·
**Commits:** `54e632e` (the EP-11b commit; the roadmap row's done hash) and the done-hash
commit, which records the hosted run below.

## Completed scope

All eight in-scope items of the brief.

1. **The `.npmrc` finding confirmed locally** (table below).
2. **Five owner decisions**, each through `AskUserQuestion`.
3. **The pin:** `.nvmrc` `26.13.1`; `engines.node` `>=26.13.1 <27`; `pnpm-workspace.yaml`
   gains `ignoreScripts`, `engineStrict`, `saveExact` and `pmOnFail: error`; `.npmrc`'s comment
   corrected.
4. **pnpm without Corepack:** `medrecsim/scripts/provision-pnpm.mjs`, run by CI in place of
   `corepack enable`, and run once on the owner's machine.
5. **`@types/node` 26.6.11** in the four manifests that declare it; `dependabot.yml`'s rule
   comment moved to 26.x.
6. **Documents:** DEPENDENCY-POLICY.md, SECURITY-BASELINE.md rows C2 and C3, ADR-4 (addendum)
   and the ADR index, both READMEs, the comments in `ci.yml`, `githooks/pre-commit` and the
   content CLI.
7. **Verification:** local, below; hosted, on a scratch branch.
8. **Records:** brief, this handoff, `docs/manual-changes.md`, roadmap row, CHANGELOG line
   (owner-approved), a message to devenv.

## EP-11a's residual risk, read back

- The owner's push landed: local `main` = `origin/main` at `958bf9a` before this work.
- Pages run 45961155699 on `958bf9a`: `build-test` ubuntu and windows green (25 steps each), 35
  negative fixtures on both lanes, 15,281 B gz on both; deploy green; `dco` and
  `dependency-review` skipped by design on push.
- Dependabot: 0 open alerts; the devalue and source-map-js alerts closed at 07:49:47 UTC on
  2026-11-27, at the push.

## The `.npmrc` finding

pnpm 11 reads only auth, registry, TLS and proxy settings from `.npmrc` (pnpm 11.0 release
notes; the settings reference), so `medrecsim/.npmrc`'s `engine-strict`, `ignore-scripts` and
`save-exact` had not reached pnpm since EP-8 adopted 11.25.0. Confirmed in scratch worktrees
with pnpm 11.25.0 (unpacked from its hash-checked tarball) under Node 26.13.1:

| # | Test | Result |
|---|---|---|
| 1 | `pnpm config get` for `engineStrict`, `ignoreScripts`, `saveExact`, `minimumReleaseAge` | undefined, undefined, undefined, 1440 (the last from `pnpm-workspace.yaml`) |
| 2 | Frozen install against `engines.node` `>=24.14.1 <25`, settings in `.npmrc` only | "Unsupported engine" warning; exit 0 |
| 3 | The same with `engineStrict: true` in `pnpm-workspace.yaml` | `ERR_PNPM_UNSUPPORTED_ENGINE`; exit 1 |
| 4 | Clean frozen install against `>=26.13.1 <27` with `engineStrict` | 206 packages, no warning, lockfile unchanged; exit 0 |
| 5 | Frozen install with jsdom's lockfile `engines.node` narrowed to exclude 26, with `engineStrict` | `ERR_PNPM_UNSUPPORTED_ENGINE` for jsdom@31.0.1; exit 1 |
| 6 | `ignoreScripts: true` and `saveExact: true` in `pnpm-workspace.yaml` | both read; `pnpm run` and nested recursive runs still run |
| 7 | `pmOnFail: error` with a matching pin, then with the pin `pnpm@11.24.0` | passes; then `install` and `run` both refused, naming the pinned version |
| 8 | `pmOnFail: download` with the pin `pnpm@11.24.0+sha512.<128 zeros>` | pnpm fetched and ran 11.24.0: its own switch does not check the pinned hash |

What it meant: the Node pin was advisory on contributors' machines and enforced only by CI's
`setup-node`. jsdom 31.0.1 and w3c-xmlserializer 6.0.0, merged at EP-11a, declare
`engines.node` `^22.22.2 || ^24.15.0 || >=26.0.0`, which excludes 24.14.1, and hosted CI
installed them under 24.14.1 from that merge until this move; test 5 shows an effective
setting would have refused them. Lifecycle scripts stayed blocked throughout, by pnpm's own
default and `allowBuilds: {}`.

## Provisioning without Corepack

**The script.** `medrecsim/scripts/provision-pnpm.mjs` (Node standard library only) reads
`pnpm@<version>+sha512.<hex>` from `package.json#packageManager`, downloads
`https://registry.npmjs.org/pnpm/-/pnpm-<version>.tgz`, refuses unless its SHA-512 equals the
pinned hash (nothing is written before that), installs the verified file with the npm bundled
beside the running Node (`npm install --global --ignore-scripts`, launched through
`process.execPath`, no shell), and checks that the `pnpm` first on PATH reports the pinned
version. Flags: none (npm's global folder, the contributor's case), `--beside-node` (the
running node's folder, CI's case) or `--prefix <dir>` (trials, no PATH check).

**Why this exit** (owner decision 1): no new dependency, no second lockfile and no third
Dependabot entry, which the other exit, a lockfile-pinned standalone `corepack` 0.36.0, would
have needed; one code path for both runners and contributors; the `packageManager` hash stays
the single source of truth. `pmOnFail: error` closes the one other path, pnpm's own version
switch, which test 8 showed ignores the pinned hash.

**Why `--beside-node` in CI.** Corepack used to write its shims beside `node`, a folder
`actions/setup-node` puts first on PATH. npm's own global folder differs by distribution: the
Windows MSI's npm carries a built-in `prefix=${APPDATA}\npm`, the official zip carries none
(checked on the 26.13.1 zip), and a runner image may add its own. Installing beside `node`
keeps the old precedence on both runner systems.

**CI step** (`ci.yml`, after `actions/setup-node`): `node scripts/provision-pnpm.mjs
--beside-node`, replacing `corepack enable`. No new `uses:`.

**Trials in scratch:**

| # | Trial | Result |
|---|---|---|
| P1 | `--prefix <scratch folder>` | verified and installed: `pnpm`, `pnpx`, `pn`, `pnx`, each as sh, `.cmd` and `.ps1`; `pnpm.cmd --version` 11.25.0 |
| P2 | No flag, npm's global prefix pointed at a scratch folder on PATH (`npm_config_prefix`) | installed; PATH check passed |
| P3 | `--beside-node` under the official Node 26.13.1 Windows zip (SHA-256 matched `SHASUMS256.txt`), its folder first on PATH | installed beside `node.exe`; PATH check passed |
| P4 | Pin `pnpm@11.24.0+sha512.<128 zeros>` | "SHA-512 mismatch … Nothing was installed."; exit 1 |
| P5 | Pin without a hash | format error; exit 1 |
| P6 | Unknown argument | usage error; exit 1 |
| P7 | Another `pnpm` (answering 9.9.9) earlier on PATH | "another pnpm comes first"; exit 1 |
| P8 | Stale Corepack shims in the target folder (copies of the machine's) | npm `EEXIST`, then the script's hint; exit 1 |

**The owner's machine** (owner decision 3). Each of the six `pnpm`/`pnpx` shims in
`%APPDATA%\npm` was checked to point at the missing `corepack\dist`, then deleted; the script
then installed pnpm 11.25.0 there. `pnpm --version` answers 11.25.0 from a fresh PowerShell,
from cmd and from Git Bash. The dead `yarn` and `yarnpkg` shims stay; devenv is told.

## The lockfile change, reviewed under §9

| Package | From → to | Licence | Publisher | Install scripts | Published | Provenance |
|---|---|---|---|---|---|---|
| `@types/node` | 24.19.2 → 26.6.11 | MIT | `types` (DefinitelyTyped) | none | 2026-11-26 00:49 UTC (about 31 h at install; `minimumReleaseAge` passed) | none (DefinitelyTyped publishes none) |
| `undici-types` (its only dependency) | 7.24.6 → 8.9.0 | MIT | GitHub Actions trusted publishing | none | 2026-07-24 | yes |

The lockfile diff (+36/−36) is these two moves plus peer-suffix renames (vite, vitest,
`@vitest/mocker`, vitefu, `@sveltejs/vite-plugin-svelte`). No package added or removed; no
runtime package moved: the bundle is unchanged at 15,281 B gz and THIRD-PARTY.md is current.

## Verification results (2026-11-27 — Windows 11, Node 26.13.1, pnpm 11.25.0 from the provisioning)

| Check | Result |
|---|---|
| `node --version` against `.nvmrc` | v26.13.1 = 26.13.1 ✔ |
| `pnpm --version` in fresh PowerShell, cmd and Git Bash | 11.25.0 ✔ |
| `pnpm install --frozen-lockfile` on the final tree | "Already up to date"; lockfile unchanged ✔ |
| `pnpm verify` on the final tree | lint, format (Prettier clean), typecheck (svelte-check 455 files 0/0, tsc), **217 tests** (21 files), content validate 0 errors (the 3 known placeholder and draft warnings), **35** negative fixtures + positive control, schema export current, compile, build, budget **15,281 B gz = 5.0 %**, no-network, SPDX (170, the new script included), assets, claims, action pins (7), layer separation — all PASS, exit 0 ✔ |
| `node scripts/gen-third-party.mjs --check` | current ✔ |
| Engine enforcement with the new settings | tests 3 and 5 above ✔ |
| Provisioning refusals | P4–P8 above ✔ |
| Hosted CI, scratch branch `scratch/ep-11b-node26` at `54e632e` (run 45965690050) | `build-test` ubuntu and windows green (25 steps each): `.nvmrc` resolved as 26.13.1; "SHA-512 matches packageManager"; "installed and first on PATH"; frozen install with pnpm v11.25.0; 217 tests, 35 fixtures, 15,281 B gz, SPDX 170 and 7 action pins on both lanes. `dco` and `dependency-review` skipped by design on push; the branch deleted after ✔ |
| Leak screen over new and modified files | 0 hits (paths, usernames, e-mail) ✔ |

## Owner decisions (presented interactively 2026-11-27; outcomes recorded)

1. **pnpm provisioning.** Options: hash-checked download (recommended); standalone Corepack
   pinned in its own lockfile; plain `npm install -g pnpm@11.25.0`. **Ruling: hash-checked
   download** → `scripts/provision-pnpm.mjs`, the CI step, `pmOnFail: error`.
2. **The three `.npmrc` settings pnpm 11 ignores.** Options: restore all three in
   `pnpm-workspace.yaml` (recommended); the engine check only; correct the documents only.
   **Ruling: restore all three.**
3. **The owner's PC.** Options: replace the dead `pnpm`/`pnpx` shims (recommended); replace
   those and the `yarn` ones; leave the PC as it is. **Ruling: replace the `pnpm` shims** →
   done; the `yarn` shims left, devenv told.
4. **Hosted CI before the owner's push.** Options: push the EP-11b commit to a scratch branch
   (recommended); no push. **Ruling: push a scratch branch** → run 45965690050 green on both
   lanes; the branch deleted.
5. **A CHANGELOG line** (wording shown in the question). Options: under a new "Changed"
   heading (recommended); under "Security"; none. **Ruling: under a new "Changed" heading.**

## Decisions logged (reversible technical, D-EXEC-003)

- `.nvmrc` pins **26.13.1** exactly (the newest 26.x, a security release, and the machine's
  version); `engines.node` `>=26.13.1 <27` accepts later 26.x patches.
- `@types/node` **26.6.11**, the newest 26.x, past `minimumReleaseAge`.
- npm, bundled with Node, installs the verified tarball, rather than an owned tar extractor;
  it is launched through `process.execPath` and `npm-cli.js`, so no shell resolves it.
- The script's PATH check runs a constant command through the shell (`pnpm.cmd` needs one on
  Windows) from a folder outside the workspace.
- `--beside-node` for CI rather than npm's default global folder (above).
- `ignoreScripts` added beside `allowBuilds: {}`, both kept; `.npmrc` kept for npm.
- DEPENDENCY-POLICY §5 gains item 7 at the end instead of being renumbered, since §5.3 and §5.4
  are cited elsewhere; ADR-4 gains a dated addendum, its EP-8 text and title kept.
- No commands-table row in `medrecsim/README.md`: its prerequisites carry the step.
- Trials ran in three scratch worktrees with a scratch pnpm store, removed at close.

## Changed files

**EP-11b commit:** `medrecsim/.nvmrc`, `medrecsim/package.json` (engines, `@types/node`),
`medrecsim/packages/{content-tools,engine,schema}/package.json` (`@types/node`),
`medrecsim/pnpm-lock.yaml`, `medrecsim/pnpm-workspace.yaml`, `medrecsim/.npmrc`,
`medrecsim/scripts/provision-pnpm.mjs` (new), `medrecsim/README.md`,
`medrecsim/packages/content-tools/src/cli.ts` (comment), `.github/workflows/ci.yml`,
`.github/dependabot.yml` (comment), `githooks/pre-commit` (message), `README.md`,
`CHANGELOG.md`, `docs/DEPENDENCY-POLICY.md`, `docs/SECURITY-BASELINE.md`,
`docs/adr/ADR-4-package-manager.md`, `docs/adr/README.md`, `docs/manual-changes.md`,
`roadmap/README.md` (row link; the EP-11b brief note retired), `roadmap/EP-11b-node-26-lts.md`,
`docs/handoffs/EP-11b.md`.

**On the owner's machine (outside the repository):** `%APPDATA%\npm` — six dead Corepack shims
removed; pnpm 11.25.0 installed by npm (`node_modules\pnpm` and the `pnpm`, `pnpx`, `pn`, `pnx`
shims).

Untouched by design: application, engine, schema and content sources; DECISIONS.md;
THIRD-PARTY.md (no runtime change).

## Found along the way

1. **pnpm 11 ignores `.npmrc` settings other than auth and registry ones** (the finding above;
   fixed on the owner's word).
2. **EP-11a's review missed jsdom 31's Node floor on the 24 line** (`^24.15.0`): it read vitest
   5's Node requirement, not jsdom's. Moot under Node 26.
3. **pnpm's own version switch ignores the `packageManager` hash** (test 8): any project relying
   on `pmOnFail: download` gets the pinned version but not the pinned bytes.
4. **SECURITY-BASELINE row C1 counts 8 action references**; `check:action-pins` counts 7 (six in
   `ci.yml`, one in `pages.yml`). Left as is, outside rows C2 and C3; for the next baseline
   re-verification (the v0.1 tag at EP-19).
5. **The old pin trailed its own line**: 24.14.1 against 24.22.3, several security releases.

## Risks / notes for the next session

- **The owner's push of `main`** runs Pages on `54e632e` and the done-hash commit (records
  only): expected green on both lanes, as on the scratch branch, then a deploy of the unchanged
  bundle.
- **`--beside-node` on the POSIX layout** (npm under `../lib/node_modules`) was exercised by the
  hosted ubuntu lane only (green); there is no macOS run.
- **Clean-machine quickstart:** not run on a machine without prior Node history; RELEASE-CRITERIA
  G9 runs it at a tag. On Linux or macOS with a root-owned Node, `npm install --global` needs a
  user-writable prefix (as with nvm); npm's `EACCES` would surface.
- **`engineStrict` now checks dependencies too:** a Dependabot PR that brings a package whose
  `engines.node` excludes 26.x fails CI's install with `ERR_PNPM_UNSUPPORTED_ENGINE`, as
  intended.
- **When `packageManager` moves**, every machine re-runs the script; pnpm refuses to run until
  then and names the version it expects. Dependabot does not update `packageManager`; pnpm
  11.29.0 and 12.x wait for EP-19's reverification.
- **The machine:** the dead `yarn` shims remain; other projects that pin another pnpm make the
  machine's pnpm 11 switch versions by itself, without a hash check, unless they set
  `pmOnFail` (handed on to devenv).

## Parked → final-roadmap.md

none.

## Next eligible EPs

**EP-12** (engine scoring, next by table order); EP-13, EP-15 and EP-20 remain eligible.
