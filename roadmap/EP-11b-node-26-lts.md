---
ep: 11b
title: "Node 26 LTS: the pin, engines and pnpm without Corepack (D-ROAD-006)"
size: M
model: claude-opus-5-5
effort: max
status: in progress
---

# EP-11b — Node 26 LTS: the pin, engines and pnpm without Corepack

**Size:** M · **Type:** implementation (toolchain, supply chain) · **Core/Stretch:** core ·
**Depends on:** EP-11a (dependency refresh) · **Blocks:** EP-12 by placement (D-ROAD-006)

## Context

D-ROAD-006 (2026-11-26, EP-11a) added this row. On 2026-11-10 winget's LTS channel moved the
owner's machine to Node 26.13.1, which ships no Corepack. The project pins Node 24.14.1
(`medrecsim/.nvmrc`; `engines.node` `>=24.14.1 <25` with `engine-strict=true` in
`medrecsim/.npmrc`) and provisions pnpm 11.25.0 through Corepack from the hash-pinned
`packageManager` field, so neither runs locally; CI installs 24.14.1 from `.nvmrc` and runs
`corepack enable`. DEPENDENCY-POLICY.md §8 and ADR-4 named this trigger and its two exits: a
lockfile-pinned `corepack` package or a hash-verified pnpm download. The row asks for `.nvmrc`
and `engines` on the current Node 26 LTS; pnpm 11.25.0 without Corepack, locally and in CI, by
one exit chosen with its reason; `@types/node` 26 with `dependabot.yml`'s ignore rule moved to
the new line; policy §5 and §8 and SECURITY-BASELINE rows C2 and C3 updated; `pnpm verify`
green locally under Node 26 and hosted CI green on both operating systems. A pnpm major stays
out unless the provisioning needs it.

**Session start (2026-11-27, about 02:50 EST).** Launched from clauderoadmapwrangler into VS
Code with claude-opus-5-5 at max (as launched; the panel's own setting is not readable from
inside the session). Read first: CLAUDE.md, DECISIONS.md, the roadmap, EP-11a's completion note
and handoff; `roadmap/owner-tasks.md` and `roadmap/inbox.md` hold nothing open. The tree is
clean at `958bf9a`, equal to `origin/main`. **EP-11a's residual risk, read back:** the owner's
push landed; Pages run 45961155699 on `958bf9a` is green on both lanes (25 steps each, 35
negative fixtures, 15,281 B gz = 5.0 %), deploy green; 0 Dependabot alerts are open (the six
devalue and source-map-js alerts closed at the push).

**Survey (2026-11-27; the npm registry, nodejs.org and `gh` read-backs).**

- **Node.** 26.13.1 (2026-11-10, LTS "Lithium", a security release) is the newest 26.x and is
  what the machine runs; 26 entered LTS at 26.13.0 on 2026-10-28. Node 24 is at 24.22.3: the
  24.14.1 pin trailed its own line by several security releases.
- **The machine.** Node 26.13.1 and npm 11.20.0 under Program Files; no `corepack`. The user's
  npm folder (`%APPDATA%\npm`, on PATH) still holds the dead Corepack shims of 2026-09-04
  (`pnpm`, `pnpx`, `yarn`, `yarnpkg`, each as sh, `.CMD` and `.ps1`), so `pnpm` fails in both
  shells; devenv's IN-11 (EP-11a's message) is still open.
- **pnpm 11.25.0.** The registry tarball's SHA-512 equals the hash in `packageManager`
  (checked). The package has no dependencies and no install scripts, needs Node >= 22.13,
  installs the bins `pnpm`, `pnpx`, `pn` and `pnx`, and carries SLSA provenance (trusted
  publishing from pnpm's release workflow). None of GitHub's 32 pnpm advisories covers it (the
  11.x ranges end below 11.11.0). Newer: 11.29.0 (2026-11-22) and 12.23.0, a native executable;
  this brief keeps 11.25.0.
- **pnpm 11 reads only auth, registry, TLS and proxy settings from `.npmrc`** (pnpm 11.0
  release notes; the settings reference). So `medrecsim/.npmrc`'s `engine-strict=true`,
  `ignore-scripts=true` and `save-exact=true` have not reached pnpm since EP-8 adopted 11.25.0.
  The tree shows it: jsdom 31.0.1 and w3c-xmlserializer 6.0.0, merged at EP-11a, declare
  `engines.node` `^22.22.2 || ^24.15.0 || >=26.0.0`, which 24.14.1 does not satisfy, yet hosted
  CI installs them under 24.14.1. The Node pin has been enforced by CI's `setup-node` only,
  never at install; lifecycle scripts stayed blocked by pnpm's own default and `allowBuilds: {}`
  in `pnpm-workspace.yaml`, which pnpm does read. Step 1 confirms this locally.
- **pnpm 11's version check.** With Corepack gone, pnpm compares itself with `packageManager`
  under one setting, `pmOnFail` (`download`, the default, fetches and runs the pinned version;
  `error` refuses to run).
- **`@types/node`.** Latest 26.6.11 (2026-11-26 00:49 UTC, past the one-day
  `minimumReleaseAge` at pickup), typed for TypeScript 6.0, the repo's line.
- **Standalone Corepack.** 0.36.0 (2026-08-28), no dependencies, Node
  `^22.22.2 || ^24.15.0 || >=26.0.0`.

**The two exits, as weighed for the owner.** (A) A hash-verified download: an owned script,
`medrecsim/scripts/provision-pnpm.mjs` (Node standard library only), reads `packageManager`,
fetches the registry tarball, checks its SHA-512 against the pinned hash, installs the verified
tarball with the npm that ships with Node (scripts ignored) and checks `pnpm --version`. One
code path serves both CI lanes and the owner's machine, the hash in `packageManager` stays the
single source of truth, and `pmOnFail: error` makes pnpm refuse any other version rather than
fetch one. (B) The standalone `corepack` package pinned in an npm lockfile of its own (`npm ci`
in a tools folder, then `corepack enable`): Corepack's flow stays as it was, at the cost of a
new dependency, a second kind of lockfile and a third Dependabot entry, for a tool Node no
longer ships.

**Confirmed locally (step 1; scratch worktrees, pnpm 11.25.0 unpacked from its hash-checked
tarball, Node 26.13.1).** `pnpm config get` reports `engineStrict`, `ignoreScripts` and
`saveExact` as undefined, while it reads `minimumReleaseAge` (1440) from `pnpm-workspace.yaml`.
A frozen install under the old pin `>=24.14.1 <25` warns "Unsupported engine" and exits 0. With
`engineStrict: true` in `pnpm-workspace.yaml` the same install fails
(`ERR_PNPM_UNSUPPORTED_ENGINE`), and a frozen install also fails when a locked dependency's
`engines.node` excludes the running Node (tested by narrowing jsdom's lockfile entry), so an
effective setting would have stopped jsdom 31 under 24.14.1 at EP-11a's merge. With the Node 26
pin, a clean frozen install passes with no warning and no lockfile change. `ignoreScripts: true`
leaves explicitly run scripts working, nested recursive runs included. `pmOnFail: error` refuses
a mismatched pin for `install` and for `run`; under the default, `download`, pnpm switched to
11.24.0 although the pinned hash was all zeros: its own switch does not check the hash in
`packageManager`. The exit (A) prototype passed six tests in scratch: a verified install into a
prefix, the default branch with its PATH check, and refusals of a wrong hash, an unhashed pin, an
unknown argument, another `pnpm` earlier on PATH, plus npm's `EEXIST` on stale Corepack shims
(the owner's machine) with the script's hint.

**Decided at pickup (the owner, 2026-11-27, through `AskUserQuestion`).**

1. **Provisioning:** exit (A), the hash-checked download, with `pmOnFail: error`.
2. **The three `.npmrc` settings:** restored in `pnpm-workspace.yaml` (`engineStrict`,
   `ignoreScripts`, `saveExact`); `.npmrc` kept for npm, its comment corrected.
3. **The owner's machine:** the six dead Corepack `pnpm` and `pnpx` shims in `%APPDATA%\npm`
   replaced by the provisioned pnpm; the dead `yarn` and `yarnpkg` shims left, devenv told.
4. **Hosted CI:** the EP-11b commit pushed to `scratch/ep-11b-node26` first, read back on both
   lanes, the branch deleted after; the push of `main` stays the owner's.

## Safety & policy preconditions

- **Synthetic-only content:** n/a — no content, case or fixture is touched.
- **Clinical sign-off (D-EXEC-003):** n/a.
- **Harm language (D-SCOR-003):** n/a.
- **Leak prevention:** the brief and handoff carry versions, hashes, run ids and counts, and
  machine paths only in their environment-variable form (`%APPDATA%\npm`); scratch work stays in
  the session's scratchpad; new and modified files are screened for paths, usernames and e-mail
  addresses before commit.
- **Licensing (D-DATA-006):** no package added; pnpm is a tool binary (§8), not redistributed;
  `@types/node` stays a dev dependency (MIT) with no THIRD-PARTY row.
- **Accessibility (D-UX-004):** n/a — no interface change. `docs/manual-changes.md` gains a
  section because the steps to start the app locally change.
- **Security baseline (D-SEC-001/002):** rows C2 and C3 are re-verified and reworded; no new
  `uses:` (C1, C12); the CI download is pinned by hash, as Corepack's was (§5.4).

## In scope

1. **Confirm the `.npmrc` finding locally**, in a scratch worktree with pnpm 11.25.0 unpacked
   into the scratchpad from its hash-checked tarball, under Node 26.13.1: what `pnpm config`
   reports for the three settings; whether a frozen install under the old 24 pin warns or fails;
   the same with `engineStrict: true` in `pnpm-workspace.yaml`; that a matching pin leaves the
   lockfile untouched; `pmOnFail: error` against a mismatched pin.
2. **Owner decisions** (below), each through `AskUserQuestion`.
3. **The pin:** `.nvmrc` `26.13.1`; `engines.node` `>=26.13.1 <27`; the engine and save
   settings made effective for pnpm in `pnpm-workspace.yaml` as decided; `.npmrc`'s header
   corrected.
4. **pnpm without Corepack**, by the chosen exit: in CI, the `corepack enable` step replaced in
   `ci.yml`; on the owner's machine, as decided.
5. **`@types/node` 26.6.11** in the root and the packages that declare it, the lockfile updated;
   `dependabot.yml`'s rule comment moved to 26.x (the rule ignores majors and stays).
6. **Documents:** DEPENDENCY-POLICY.md (status line, the §4 `@types/node` row, §5, the §8 Node
   and pnpm rows, §9's rule note); SECURITY-BASELINE.md rows C2 and C3; ADR-4 (a dated addendum,
   the decision text kept); the root README's quickstart and `medrecsim/README.md`'s
   prerequisites; the comments that name Node 24 or Corepack as current (`ci.yml`,
   `githooks/pre-commit`, the content CLI's header).
7. **Verification:** frozen install and `pnpm verify` under Node 26.13.1 with the provisioned
   pnpm; the provisioning refuses a wrong hash; hosted CI on both lanes (a scratch branch on the
   owner's word, else at the owner's push).
8. **Records:** this brief's completion note; `docs/handoffs/EP-11b.md`; a
   `docs/manual-changes.md` section; the roadmap row's link and done hash; a CHANGELOG line only
   if the owner approves its wording; a message to devenv about the machine.

## Out of scope

- **A pnpm update** (11.29.0) or **major** (12.x): policy §8 reverifies tool binaries at the
  R-phase boundary, next **EP-19**; neither exit needs one.
- **Other tool binaries** (gitleaks, `gh`, git): EP-19.
- **pnpm-managed Node** (`devEngines.runtime`): a different provisioning model, not asked for.
- **The machine's dead `yarn` and `yarnpkg` shims** and other projects' pnpm: not medrecsim's;
  handed on to devenv.
- **EP-11a's re-plan candidates** (THIRD-PARTY.md currency in CI, a reviewer for the weekly
  Dependabot PRs): the post-EP-19 re-plan.
- **TypeScript 7:** its ignore rule stands. **Engine work:** EP-12. **The push:** the owner's.

## Owner checkpoints

- The provisioning exit (A or B).
- The `.npmrc` settings pnpm 11 ignores: restore them in `pnpm-workspace.yaml`, or correct the
  documents only.
- The owner's machine: replace the dead Corepack `pnpm` and `pnpx` shims in `%APPDATA%\npm` with
  the provisioned pnpm, or leave the machine as it is.
- A scratch-branch push to run hosted CI before the commit lands.
- Outward text (a CHANGELOG line; the policy and README wording ride with the commit).
- Commits run under the autopilot (crw D-22); the push stays the owner's.

## Verification / acceptance

- `node --version` = `v26.13.1` = `.nvmrc`; `pnpm --version` = `11.25.0` in PowerShell and Git
  Bash on the owner's machine, if the owner agrees to the machine change.
- The provisioning refuses a tampered hash (non-zero exit, nothing installed) and accepts the
  pinned one.
- `pnpm install --frozen-lockfile` passes on the final tree and leaves the lockfile unchanged;
  with the engine check effective, an install against an `engines` range that excludes the
  running Node fails (`ERR_PNPM_UNSUPPORTED_ENGINE`).
- `pnpm verify` passes under Node 26.13.1: lint, format, typecheck with `@types/node` 26, tests,
  the content stage (35 negative fixtures), build, budget, checks.
- `check:action-pins` passes (no new `uses:`); `check:spdx` covers the new script.
- Hosted CI green on both lanes, read back from the run.
- No current document names Corepack or Node 24 as the project's toolchain (historical records
  excepted); the leak screen is clean.

**Residual risk.** `--beside-node` on the POSIX layout (npm under `../lib/node_modules`) is
exercised only by the hosted ubuntu lane, read back on the scratch branch. The clean-machine
quickstart was not run on a machine without prior Node history (RELEASE-CRITERIA G9 runs it
at a tag); on Linux or macOS with a root-owned Node, `npm install --global` needs a
user-writable prefix, as with nvm, and npm's `EACCES` would surface. `engineStrict` now
checks dependencies' `engines.node` too, so a Dependabot PR bringing a package that excludes
26.x fails CI's install, as intended. When `packageManager` moves, every machine re-runs the
script, and pnpm refuses to run until then. On the machine, the dead `yarn` shims remain, and
other projects that pin another pnpm make pnpm 11 switch versions by itself without a hash
check unless they set `pmOnFail` (handed on to devenv). Each is expected to hold or to fail
loudly: the script, pnpm and npm all exit non-zero with a message naming the cause.

## Handoff

`docs/handoffs/EP-11b.md`: the survey, the `.npmrc` finding with its evidence and its local
confirmation, the provisioning exit and why, the CI and local commands, the verification table,
the owner decisions, the changed files, and what the owner's push must still show.

## Parked → final-roadmap.md

none.

> **Completion note (2026-11-27; claude-opus-5-5/max, as launched — the VS Code panel's own
> setting is not readable from inside the session; duration recorded with the done hash).**
>
> **What was done.** Judged at pickup to fit one M, so not split. EP-11a's residual read back
> clean (its push green on both lanes with 35 fixtures; 0 open alerts). The survey found pnpm
> 11 ignoring `medrecsim/.npmrc`'s `engine-strict`, `ignore-scripts` and `save-exact` since
> EP-8, confirmed in scratch worktrees (an install on the wrong Node only warned), and pnpm's
> own version switch ignoring the `packageManager` hash. The project now pins Node 26.13.1
> (`.nvmrc`; `engines.node` `>=26.13.1 <27`, enforced by `engineStrict` in
> `pnpm-workspace.yaml`, beside `ignoreScripts`, `saveExact` and `pmOnFail: error`). pnpm
> 11.25.0 comes from `medrecsim/scripts/provision-pnpm.mjs`, a hash-checked download installed
> with Node's bundled npm: CI runs it with `--beside-node` in place of `corepack enable`, and
> the owner's machine got it in `%APPDATA%\npm` after six dead Corepack shims were removed.
> `@types/node` is 26.6.11 (with `undici-types` 8.9.0); the policy (status, §4, §5, §8, §9,
> §11), SECURITY-BASELINE rows C2 and C3, ADR-4 (addendum), both READMEs and the CHANGELOG are
> current. `pnpm verify` passes under Node 26.13.1. Full record:
> [docs/handoffs/EP-11b.md](../docs/handoffs/EP-11b.md).
>
> **Owner decisions.**
>
> | # | Decision | Owner's answer | Outcome |
> |---|---|---|---|
> | 1 | How pnpm is provisioned without Corepack | Hash-checked download (recommended; not standalone Corepack, not a plain `npm install -g`) | `scripts/provision-pnpm.mjs`, the CI step, `pmOnFail: error` |
> | 2 | The three `.npmrc` settings pnpm 11 ignores | Restore all three in `pnpm-workspace.yaml` (recommended) | `engineStrict`, `ignoreScripts`, `saveExact`; `.npmrc` kept for npm |
> | 3 | The owner's PC | Replace the dead `pnpm`/`pnpx` shims (recommended) | pnpm 11.25.0 in `%APPDATA%\npm`; `yarn` shims left; devenv told |
> | 4 | Hosted CI before the owner's push | Push the EP-11b commit to a scratch branch (recommended) | recorded with the done hash |
> | 5 | A CHANGELOG line (wording shown) | Under a new "Changed" heading (recommended) | added |
>
> Commits run under the autopilot (crw D-22): the EP-11b commit (the roadmap row's done hash),
> then the done-hash commit; the push of `main` is the owner's.
>
> **Routine choices** (logged in the handoff): the exact pin 26.13.1 with a `<27` range; npm as
> the installer of the verified tarball; `--beside-node` for CI; §5's new item 7 appended, not
> renumbered; ADR-4 amended by addendum; trials in scratch worktrees, removed at close.
>
> **For later sessions.** SECURITY-BASELINE row C1 counts 8 action references where
> `check:action-pins` counts 7 (for the baseline re-verification at EP-19's tag). Dependabot
> does not update `packageManager`; pnpm 11.29.0 and 12.x wait for EP-19.

> **Handed on (to devenv).** Machine facts from medrecsim EP-11b (2026-11-27), following IN-11
> (from medrecsim EP-11a). (1) On the owner's word, the six dead Corepack shims `pnpm` and `pnpx`
> (each as sh, `.CMD` and `.ps1`) in `%APPDATA%\npm` were deleted and pnpm 11.25.0 installed
> there by npm, from the registry tarball checked against medrecsim's pinned SHA-512 (its
> `scripts/provision-pnpm.mjs`): `pnpm` now runs in PowerShell, cmd and Git Bash for every
> project, and the commands `pn` and `pnx` are new beside it. (2) The dead `yarn` and `yarnpkg`
> shims (sh, `.CMD`, `.ps1`) remain in that folder, still pointing at the missing
> `corepack\dist`; a project needing Yarn fails until they are replaced or removed. (3) pnpm 11
> fetches and runs another project's pinned pnpm by itself unless that project sets `pmOnFail`,
> and that switch does not check the pin's `+sha512` hash (tested). (4) pnpm 11 reads only auth
> and registry settings from `.npmrc`: settings such as `engine-strict` or `ignore-scripts`
> there are ignored and belong in `pnpm-workspace.yaml` in camelCase, which may matter to other
> pnpm projects here. (5) Node's Windows MSI ships npm with a built-in `prefix=${APPDATA}\npm`;
> the official zip carries none, so a portable Node's global folder is its own.
