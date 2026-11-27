# EP-11a handoff — Dependency refresh

**Status:** complete — six owner decisions ruled 2026-11-26 (see "Owner decisions"); the push
is the owner's · **Date:** 2026-11-26 · **Brief:** roadmap/EP-11a-dependency-refresh.md ·
**Commits:** on GitHub, the owner-approved squash merges `54bcd13` (PR #10) and `925fbf7`
(PR #11); locally, `9215dda` (token-trap fix), the EP-11a commit (lockfile, policy, notices,
changelog, records) and the done-hash commit, whose hashes the roadmap row and the brief's
completion note carry.

## Completed scope

All seven in-scope items of the brief.

1. **PR #10 reviewed and merged** (successor of #7).
2. **PR #11 reviewed and merged** (successor of #9), with the bundle growth explained first.
3. **Merges on the owner's word**, squash, each pinned to its reviewed head commit
   (`--match-head-commit`); local `main` fast-forwarded; the Pages runs on both merge commits
   read back green.
4. **Merged `main` verified locally** under Node 24.14.1; `zod` and `devalue` confirmed absent
   from the built and the deployed bundle; THIRD-PARTY.md regenerated.
5. **The six alerts still open after the merges resolved by update** (lockfile-only
   re-resolution inside declared ranges); every one of the 39 alerts' vulnerable ranges checked
   absent from the final lockfile.
6. **DEPENDENCY-POLICY.md** brought current (status line, §3, §4, licence census, §8).
7. **Records:** brief, this handoff, roadmap row, CHANGELOG line (owner-approved).

## The PR succession

Dependabot's weekly run at 23:34–23:40 UTC on 2026-11-25, minutes after the sweep's push,
closed #7 and #9 and opened **#10** and **#11**, which carry every update the named PRs did,
at newer versions. No Dependabot PR had ever been merged here: #1–#9 were each superseded by
the next week's run, so the toolchain was still as EP-8 seeded it on 2026-09-04.

## Review of PR #10 (github-actions group)

| Action | From → to | New SHA = release-tag commit | Published | Notes |
|---|---|---|---|---|
| `actions/setup-node` | 7.0.0 → 7.1.0 | `949feb2…` ✔ | 2026-10-08, not prerelease | mise.toml support, absolute `node-version-file`, version validation + manifest retry; no breaking change |
| `actions/dependency-review-action` | 5.0.0 → 5.0.1 | `bbc44d1…` ✔ | 2026-11-17, not prerelease | better compare-endpoint errors; dependency updates |

CI on the PR: `build-test` ubuntu and windows (every step), `dco`, `dependency-review` green.
**Verdict: merge** — two official actions, minor/patch, SHAs verified, CI green.

## Review of PR #11 (npm-dependencies group, 16 updates)

| Package | From → to | Kind | Published (age at review) |
|---|---|---|---|
| `svelte` (runtime) | 5.57.0 → 5.59.1 | minor | 2026-11-20 (6 d) |
| `vitest` | 4.1.11 → 5.1.1 | **major** | 2026-11-18 (9 d) |
| `jsdom` | 30.0.1 → 31.0.1 | **major** | 2026-11-13 (14 d) |
| `zod` (schema) | 4.5.4 → 4.6.7 | minor | 2026-10-12 (46 d) |
| `vite` | 8.2.2 → 8.3.8 | minor | 2026-11-11 (16 d) |
| `eslint` | 10.9.1 → 10.15.0 | minor | 2026-11-13 (13 d) |
| `typescript-eslint` | 8.69.0 → 8.73.0 | minor | 2026-11-16 (11 d) |
| `eslint-plugin-svelte` | 3.23.0 → 3.24.1 | minor | 2026-11-07 (20 d) |
| `prettier` | 3.9.6 → 3.10.1 | minor | 2026-11-12 (15 d) |
| `prettier-plugin-svelte` | 4.1.1 → 4.2.0 | minor | 2026-11-17 (9 d) |
| `globals` | 17.12.0 → 17.14.0 | minor | 2026-11-01 (26 d) |
| `fast-check` | 4.9.0 → 4.11.0 | minor | 2026-11-21 (5 d) |
| `svelte-check` | 4.7.6 → 4.7.8 | patch | 2026-11-01 (25 d) |
| `@sveltejs/vite-plugin-svelte` | 7.3.0 → 7.3.1 | patch | 2026-09-23 (65 d) |
| `yaml` | 2.9.0 → 2.9.1 | patch | 2026-09-11 (76 d) |
| `@types/node` | 24.13.3 → 24.19.2 | minor (same Node line) | 2026-10-09 (48 d) |

- **Changelogs (§9.1).** No licence change, no new maintainer, no install script in any of the
  16 (only `prepare` hooks, which registry installs never run; pnpm blocks lifecycle scripts
  here regardless). Every version predates the one-day `minimumReleaseAge`. The majors:
  vitest 5 requires Node 22+ and Vite 6.4+ (here 24 and 8), stops looking up configs in
  ancestor directories (each package has its own), makes inline projects extend the root
  (the root lists directories, not inline projects), clears mocks before each test and fails
  un-awaited assertions — all covered by the 217 tests passing; jsdom 31 swaps the canvas
  backend (unused), rewrites CSS parsing and computed styles, and pauses parsing at blocking
  scripts (no effect on the tests). svelte's one "breaking" note (5.58) concerns experimental
  async mode, which `svelte.config.js` does not enable. zod 4.6.6 is the fix for the alerted
  memory-exhaustion advisory; the exported JSON Schema is byte-identical (`schema:check`).
- **Lockfile diff (§9.2).** 22 new package names, 26 removed (jsdom 30's CSS stack, vitest 4's
  internals), the rest version moves. The new names fall into four families: flat-cache /
  cacheable (from eslint's file-entry-cache 11), rolldown's wasm32 fallback binding with its
  emnapi and `tslib` dependencies (platform-gated to `cpu: wasm32`, so never installed on
  either CI lane or here; `@emnapi/*` there are 2.0.0 betas), jsdom 31's selector helpers
  (`bcp-47`, `is-*`) and minimatch 11's `@isaacs/nonrecursive-glob-match`. All permissively
  licensed; one licence new to the lockfile, 0BSD (`tslib`), is on §6.2's list. Five
  transitive packages changed publisher, each checked against its registry provenance:
  file-entry-cache and flat-cache (built from jaredwray/cacheable), minimatch (built from
  isaacs/minimatch), tinybench (built from tinylibs/tinybench; the old publisher is still a
  maintainer), why-is-node-running (published by a listed co-maintainer from
  mafintosh/why-is-node-running). svelte 5.59.1's provenance names sveltejs/svelte's release
  workflow.
- **CI (§9.3).** Run 45723151917: both lanes every step green, 217 tests, bundle budget
  **15,281 B gz = 5.0 %** against `main`'s 11,644 B (3.8 %).
- **The bundle growth, explained before the merge.** A local build at #11's head lists the
  same bundled packages as `main` (`svelte` alone). An in-memory build listing svelte's source
  modules shows the growth inside svelte's client runtime: `internal/client/runtime.js`
  (+10.6 K rendered characters), `reactivity/batch.js` (+7.2 K), `dom/operations.js` (+3 K),
  event handling and boundaries, and a new `custom-renderer/state.js` — svelte 5.59.0's custom
  renderer API and 5.58's batching rework, which every svelte app now carries.

**Verdict: merge** — publishers, licences and scripts clean; majors compatible; CI green; no
new package in the bundle; 33 of the 39 open alerts closed by it.

## Alert ledger (39 open on 2026-11-25; checked against the final lockfile)

| Package | Alerts | Vulnerable → locked | Resolution |
|---|---|---|---|
| `vite` | #21–#38 (18: 6 advisories × 3 manifests) | ≤ 8.2.3 → 8.3.8 | update — PR #11 |
| `undici` | #2, #4–#6, #9–#11, #42, #43, #45, #46 (11) | < 8.12.2 → 8.13.1 | update — PR #11 (jsdom 31) |
| `@vitest/mocker` | #39, #40 | < 4.1.12 → 5.1.1 | update — PR #11 (vitest 5) |
| `zod` | #47, #48 | < 4.6.6 → 4.6.7 | update — PR #11 |
| `devalue` | #14, #15, #17, #18, #20 | ≤ 5.9.2 → 5.9.4 | update — lockfile re-resolution under svelte's `^5.9.2` (EP-11a commit) |
| `source-map-js` | #19 | < 1.2.2 → 1.2.4 | update — lockfile re-resolution under postcss's `^1.2.1` (EP-11a commit) |

A checker run over all 39 vulnerable ranges matched 39 in the pre-EP-11a lockfile and **0** in
the final one; the 9 alerts GitHub had auto-dismissed also match nothing. After the merges
GitHub showed 6 open (devalue ×5, source-map-js ×1, as predicted); its rescan also created
#49–#53 (minimatch, undici, brace-expansion advisories published since the previous scan) and
marked them fixed in the same minute. The devalue and source-map-js alerts close on the
owner's push of the EP-11a commit.

**How the devalue re-resolution was made.** `pnpm update -r --depth Infinity devalue` left it
at 5.9.2 (pnpm does not re-resolve a package that no importer names directly), so a temporary
`overrides: { devalue: ^5.9.3 }` steered pnpm's own resolver to 5.9.4 and was then removed;
the following install reported "Already up to date". The committed lockfile is what a fresh
in-range resolution gives; no override and no pin is committed (§9's first preference, update).
devalue 5.9.4: MIT, published 2026-09-18 from sveltejs/devalue's release workflow, no scripts.

## The zod and devalue bundle checks

- Local build of the final tree: `bundle-manifest.json` = `["svelte"]`; entry
  `assets/index-DLmzVb_H.js`, byte-identical in name to the build at #11's head (the devalue
  update cannot reach the bundle).
- Deployed site after the merges: `bundle-manifest.json` = `["svelte"]`, same entry file name —
  the hosted ubuntu build and the local Windows build agree.
- The built JS contains no zod or devalue code (the only case-insensitive "devalue" match is
  `nodeValue`).

## Verification results (2026-11-26 — Windows 11, portable Node 24.14.1, pnpm 11.25.0 via Corepack)

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` (merged main) | supply-chain policies pass (239 entries); 207 packages ✔ |
| `pnpm verify` on the final tree | lint, format, typecheck (svelte-check 0/0), **217 tests** (21 files), content validate 0 errors, **35** negative fixtures + positive control, schema export current, compile, build, budget **15,281 B gz = 5.0 %**, no-network, SPDX (169), assets, claims, action pins, layer separation — all PASS, exit 0 ✔ |
| `node scripts/gen-third-party.mjs --check` | current after `pnpm notices` (it was stale on the merged `main`) ✔ |
| Alert ranges vs final lockfile | 0 of 39 open (and 0 of 9 auto-dismissed) match ✔ |
| Hosted, merged `main` (Pages run 45938337308, `925fbf7`) | `build-test` ubuntu (25 steps) and windows (24) green, budget 15,281 B gz on both, deploy green; `dco` and `dependency-review` skipped by design on push ✔ |
| Leak screen over new and modified files | 0 hits (paths, usernames, e-mail) ✔ |

The EP-11a commit's own hosted run happens at the owner's push (see "Risks").

## Found along the way

1. **The machine moved to Node 26** (winget's LTS channel, 2026-11-10): Node 26.13.1 ships no
   Corepack, so the project's Node 24 pin cannot run locally, and the Corepack shims left in the
   user's npm folder now fail, breaking `pnpm` in both shells for every project. CI is
   unaffected. This session ran a checksum-verified portable Node 24.14.1 from its scratch
   folder, with `corepack enable pnpm` writing a shim beside that `node.exe` so nested `pnpm`
   calls resolve to it. The owner chose a new row, **EP-11b** (D-ROAD-006); the machine-wide
   facts are handed on to devenv.
2. **The `*token*` ignore rule had hidden three paths** since EP-9/EP-10: two negative fixtures
   and `docs/design/DESIGN-TOKENS.md`. **Correction:** the "35/35 negative fixtures" in the EP-9
   and EP-11 handoffs were local results; hosted CI ran 33 until `9215dda`. Fixed on the
   owner's word in that separate commit.
3. **THIRD-PARTY.md is not checked in CI**: PR #11 moved the runtime closure and left it stale
   until this session regenerated it. Release criteria catch it at a tag; a `--check` step in CI
   would catch it at the merge (a re-plan candidate).
4. **Weekly Dependabot PRs have no reviewer in the roadmap**: 11 weeks of PRs were superseded
   unreviewed before D-ROAD-005 (a re-plan candidate).

## Owner decisions (presented interactively 2026-11-26; outcomes recorded)

1. **Merge PR #10.** Options: squash-merge now (recommended); merge commit; the owner merges;
   hold. **Ruling: squash-merge now** → `54bcd13`.
2. **Merge PR #11** (bundle growth explained first). Same options. **Ruling: squash-merge
   now** → `925fbf7`.
3. **The Node line.** Options: new row EP-11b before EP-12 (recommended); stay on 24 until
   EP-19 with a portable Node per session; stay on 24 with a second install. **Ruling: new row
   EP-11b** → D-ROAD-006, roadmap row and brief note.
4. **Outward text** (DEPENDENCY-POLICY.md, regenerated THIRD-PARTY.md, the CHANGELOG
   "Security" line). Options: keep all (recommended); keep all but the CHANGELOG; revert all.
   **Ruling: keep all three.**
5. **The two hidden fixtures** (outside the brief). Options: fix now in its own commit
   (recommended); EP-11b's brief notes; the re-plan. **Ruling: fix now** → `9215dda`.
6. **DESIGN-TOKENS.md** (same trap). Options: commit it with the fixtures (recommended);
   EP-11b's brief notes; leave it. **Ruling: commit it with the fixtures** → `9215dda`.

## Decisions logged (reversible technical, D-EXEC-003)

- Local verification under a **portable Node 24.14.1** (the `.nvmrc` pin, SHA-256 checked
  against nodejs.org's list) rather than the machine's Node 26 with `engine-strict` off.
- The pre-merge analysis build ran in a **scratch worktree** at #11's head, removed at close.
- **Squash merges** (main's history stays linear), each pinned with `--match-head-commit`.
- devalue re-resolved through a **temporary override**, removed before commit (see the ledger).
- THIRD-PARTY.md regenerated by its script; its generated line carries the UTC date
  (2026-11-27).
- The CHANGELOG line sits under a Keep-a-Changelog **"Security"** heading, before "Content".

## Changed files

**On GitHub (owner-approved merges):** `.github/workflows/ci.yml` (#10); `medrecsim/package.json`,
`medrecsim/packages/{app,content-tools,engine,schema}/package.json`, `medrecsim/pnpm-lock.yaml`
(#11).

**`9215dda`:** `.gitignore` (three un-ignore lines), `docs/design/DESIGN-TOKENS.md`,
`medrecsim/tests/synthetic-fixtures/negative/{act-001-probability-token,disc-001-bad-type-token}/fixture.yaml`.

**EP-11a commit:** `medrecsim/pnpm-lock.yaml` (devalue 5.9.4; source-map-js 1.2.1 dropped),
`docs/DEPENDENCY-POLICY.md`, `THIRD-PARTY.md`, `CHANGELOG.md`, `DECISIONS.md` (D-ROAD-006),
`roadmap/README.md` (EP-11a link, EP-11b row, brief note, dated note),
`roadmap/EP-11a-dependency-refresh.md`, `docs/handoffs/EP-11a.md`.

Untouched by design: application, engine, schema and content sources; `dependabot.yml`;
SECURITY-BASELINE.md (no accepted risk was needed); `docs/manual-changes.md` (nothing a user
sees or does changed).

## Risks / notes for the next session

- **Unverified until the owner's push:** the EP-11a commit's hosted CI (both lanes, now with
  35 negative fixtures) and the closing of the six devalue and source-map-js alerts (expected
  open count: 0). EP-11b reads both back first.
- **Node 24 locally needs the portable workaround** until EP-11b lands; `pnpm` from the
  machine's PATH fails in both shells.
- **vitest 5's new defaults** (mocks cleared before each test, un-awaited assertions fail)
  apply to every test EP-12 writes.
- **svelte minors can move the runtime size**: +3.6 KB gz from 5.57 to 5.59 on a hello-world
  page; the budget stands at 5.0 %.
- THIRD-PARTY.md currency and the weekly Dependabot review, as above.

## Parked → final-roadmap.md

none.

## Next eligible EPs

**EP-11b** (Node 26 LTS, next by table order), then **EP-12**; EP-13, EP-15 and EP-20 remain
eligible.
