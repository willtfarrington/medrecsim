---
ep: 11a
title: "Dependency refresh: Dependabot PRs #9 and #7 (superseded by #11 and #10) and the open alerts (D-ROAD-005)"
size: M
model: claude-opus-5-5
effort: max
status: done
---

# EP-11a — Dependency refresh: Dependabot PRs #9 and #7 and the open alerts

**Size:** M · **Type:** implementation (supply chain) · **Core/Stretch:** core ·
**Depends on:** EP-8 (toolchain bootstrap) · **Blocks:** EP-12 by placement (D-ROAD-005: the
engine work starts on current tools)

## Context

D-ROAD-005 (2026-11-25) added this row after the sweep's push reported 39 open Dependabot alerts
on `main` and two Dependabot PRs, #9 (15 npm updates) and #7 (`actions/setup-node`), waiting
since October. It is reviewed under [docs/DEPENDENCY-POLICY.md](../docs/DEPENDENCY-POLICY.md)
§9 (changelogs, the lockfile diff, CI green on both operating systems with the bundle budget;
merge or close with a one-line reason; advisories resolved by update, pin, removal or an
accepted risk, in that order) and D-SEC-002 (reviewed, never auto-merged). Merges are the
owner's word.

**What changed since the row was written (survey, 2026-11-26, `gh` read-backs).**

- Dependabot's weekly run at 23:34–23:40 UTC on 2026-11-25, minutes after the sweep's push,
  **superseded both PRs**: #7 is closed and replaced by **#10** (`actions/setup-node` 7.0.0 →
  7.1.0, as #7, plus `actions/dependency-review-action` 5.0.0 → 5.0.1); #9 is closed and
  replaced by **#11** (16 updates: #9's 15 packages at newer versions, svelte to 5.59.1 instead
  of 5.57.3, vitest 5.1.1, jsdom 31.0.1, plus `prettier-plugin-svelte` 4.1.1 → 4.2.0). The
  review therefore falls on #11 and #10, which carry every update the two named PRs did.
- No Dependabot PR has ever been merged here: #1–#9 were each superseded by the next week's
  run, so the toolchain is still as EP-8 seeded it on 2026-09-04 (with EP-9's `zod` and `yaml`).
- Both successors are green on all four required checks (`build-test` ubuntu and windows,
  `dco`, `dependency-review`), every step on both lanes, 217 tests. #11's build measures
  **15,281 B gz initial JS (5.0 % of budget)** against `main`'s **11,644 B (3.8 %)**: +3,637 B
  from svelte 5.57.0 → 5.59.1 on a hello-world page, to be explained before any merge.

**Open alerts (39; plus 9 auto-dismissed by GitHub's preset), by package.**

| Package | Alerts | Relationship | Fixed in | After #11's lockfile |
|---|---|---|---|---|
| `vite` | 18 (6 advisories × 3 manifests) | direct, dev | 8.2.4 | 8.3.8 — closes |
| `undici` | 11 | transitive (jsdom), dev | 8.12.2 | 8.13.1 — closes |
| `devalue` | 5 | transitive (svelte), labelled dev | 5.9.3 | still 5.9.2 — open |
| `@vitest/mocker` | 2 | transitive (vitest), dev | 4.1.12 | 5.1.1 — closes |
| `zod` | 2 | direct (schema), labelled **runtime** | 4.6.6 | 4.6.7 — closes |
| `source-map-js` | 1 | transitive (postcss 8.5.28 under the lint tools), dev | 1.2.2 | 1.2.1 kept beside 1.2.4 — open |

So #11 alone closes 33; six stay open (devalue ×5, source-map-js ×1), both re-resolvable inside
the ranges their parents already declare. `zod` is labelled runtime by Dependabot but classed
dev/build by the policy (ESLint refuses its import from the app and engine); THIRD-PARTY.md
(generated 2026-09-04) lists devalue as a compile-time dependency of svelte, not bundled. Both
claims are checked against a fresh build here.

## Safety & policy preconditions

- **Synthetic-only content:** n/a — no content, case or fixture is touched.
- **Clinical sign-off (D-EXEC-003):** n/a — no accepted/unsafe set, scoring or teaching content.
- **Harm language (D-SCOR-003):** n/a.
- **Leak prevention:** the brief and handoff carry package names, versions, advisory ids, counts
  and run ids only; scratch output stays in the session's scratchpad; new and modified files
  are screened for paths, usernames and e-mail addresses before commit.
- **Licensing (D-DATA-006, policy §6.2):** each changelog read for licence changes; the
  closure's licences compared before and after; `dependency-review`'s allow-list ran on both
  PRs; THIRD-PARTY.md regenerated for the runtime closure.
- **Accessibility (D-UX-004):** n/a — no interface change (the app is still the hello-world
  shell); no `docs/manual-changes.md` section, since nothing a user sees or does changes.
- **Security baseline (D-SEC-001/002):** the brief exercises the controls rather than changing
  them — SHA pins (C1, C12), frozen lockfile (C3), `ignore-scripts` + `allowBuilds: {}` +
  `minimumReleaseAge` (C2), dependency review (C7), reviewed-never-auto-merged. svelte is the
  only runtime package; its version bump inside the allowlisted row rides on the owner's merge
  word; any *new* package in the bundle would be a §3 owner decision and stops the merge.

## In scope

1. **Review #10** per §9: release notes of both actions; the diff (two `uses:` lines); each new
   SHA resolves to its release tag upstream; CI read-back.
2. **Review #11** per §9: release notes of the 16 packages (licence changes, install scripts,
   maintainers, the two majors — vitest 5 and jsdom 31 — against this repo's config); the
   lockfile diff, with every *new* transitive package's name, publisher and scripts glanced at;
   publish ages against `minimumReleaseAge`; CI read-back with the bundle budget; the
   +3,637 B gz explained from the bundle manifest of a local build at #11's head.
3. **Merges on the owner's word**, one question per PR; on a yes, merge on GitHub and
   fast-forward local `main`; read back the Pages run on the merged `main` (both lanes).
4. **On the merged `main`:** frozen install and `pnpm verify` on Windows; the built
   `bundle-manifest.json` lists no `zod` and no `devalue`, and the built JS carries no zod
   markers; THIRD-PARTY.md regenerated (`pnpm notices`) for svelte 5.59.1's closure.
5. **The alerts still open**, after Dependabot's rescan, resolved in §9's order: devalue and
   source-map-js by update (a lockfile-only re-resolution inside declared ranges, verified
   locally and against each advisory's vulnerable range); failing that a pin (pnpm
   `overrides`), a removal, or an accepted risk in SECURITY-BASELINE.md with a re-check date
   (an owner decision).
6. **DEPENDENCY-POLICY.md:** status line; §3 svelte row (version, re-measured gzipped figure);
   §4 rows (versions and the notes that named old versions); closure count and licence notes.
7. **Records:** this brief's completion note, `docs/handoffs/EP-11a.md`, the roadmap row's
   link and done hash; a CHANGELOG line only if the owner approves its wording.

## Out of scope

- **Tool binaries** (Node 24.14.1, pnpm 11.25.0, gitleaks, `gh`, git): policy §8 reverifies
  them at the R-phase boundary, next **EP-19**.
- **TypeScript 7 and `@types/node` majors:** ignored in `dependabot.yml` for reasons that still
  stand (policy §9); not revisited here.
- **Dependabot settings** (security-update PRs, grouping, cooldowns) and repository settings: a
  change would be an owner decision for the post-EP-19 re-plan, not this row.
- **The 9 auto-dismissed alerts:** not open; noted in the handoff only.
- **Engine work:** EP-12. **The push:** the owner's.

## Owner checkpoints

- Merge #10 (yes, how, or hold).
- Merge #11 (yes, how, or hold), after the bundle growth is explained.
- Any accepted risk, if an alert survives update, pin and removal.
- Any outward text (a CHANGELOG line).
- Commits run under the autopilot (crw D-22); the push stays the owner's.

## Verification / acceptance

- Both PRs reviewed per §9 with a one-line merge-or-close reason in the handoff; merges made
  only on the owner's recorded word.
- `pnpm install --frozen-lockfile` and `pnpm verify` pass locally (Windows) on the final tree.
- The final build's `bundle-manifest.json` lists `svelte` only; no zod marker in `dist`.
- `node scripts/gen-third-party.mjs --check` passes.
- Every open alert's vulnerable range is absent from the final lockfile (checked package by
  package); the open-alert count is read back after the merges, and after the owner's push for
  any lockfile change this session commits.
- The Pages run on the merged `main` is green on both lanes with the bundle budget.

## Handoff

`docs/handoffs/EP-11a.md`: the PR succession, the per-PR review (packages, majors, new
transitive packages, publish ages, licences), the bundle-growth finding, the alert ledger
(each alert → its resolution), the zod and devalue bundle checks, owner decisions, and what the
owner's push must still show.

## Parked → final-roadmap.md

none expected (scope is frozen; anything found goes there or to the re-plan's residual risks).

> **Completion note (2026-11-26; claude-opus-5-5/max, as launched — the VS Code panel's own
> setting is not readable from inside the session; about 50 minutes of working time, 22:40 to
> the commits at about 23:30, the owner's answers included).**
>
> **What was done.** Judged at pickup to fit one M, so not split. #9 and #7 had been
> superseded by #11 and #10 at 23:34–23:40 UTC on 2026-11-25; both were reviewed under §9
> (release notes, the lockfile diff with every new package's publisher, licence, scripts and
> provenance, publish ages, CI on both lanes with the budget) and squash-merged on the owner's
> word: `54bcd13` (#10), `925fbf7` (#11). Before the merge question, #11's bundle growth
> (11,644 → 15,281 B gz, 5.0 % of budget) was traced to svelte's own runtime (5.59's custom
> renderer API, 5.58's batching rework): the bundle manifest lists `svelte` alone, locally and
> on the deployed site, so `zod` and `devalue` stay out of the app. The six alerts the merges
> left open (devalue ×5, source-map-js ×1) were resolved by update, a lockfile-only
> re-resolution inside the ranges svelte and postcss declare; no override, pin or accepted
> risk was needed, so SECURITY-BASELINE.md is unchanged. All 39 alerts' vulnerable ranges are
> absent from the final lockfile; `pnpm verify` passes under Node 24.14.1; THIRD-PARTY.md is
> regenerated; DEPENDENCY-POLICY.md is current. Full record:
> [docs/handoffs/EP-11a.md](../docs/handoffs/EP-11a.md).
>
> **Found along the way.** The owner's machine moved to Node 26 on 2026-11-10 (no Corepack;
> the Node 24 pin cannot run locally; `pnpm` broken in both shells), so local checks ran on a
> checksum-verified portable Node 24.14.1. The `*token*` ignore rule had hidden two EP-9
> negative fixtures and EP-10's DESIGN-TOKENS.md: hosted CI ran 33 fixtures, not the 35 the
> EP-9 and EP-11 handoffs reported.
>
> **Owner decisions.** (1) Merge #10: **squash-merge now** → `54bcd13`. (2) Merge #11, after
> the bundle explanation: **squash-merge now** → `925fbf7`. (3) The Node line: **a new row
> EP-11b before EP-12** (recommended; alternatives: stay on 24 until EP-19 with a portable
> Node per session, or a second Node 24 install) → D-ROAD-006, the roadmap row, its brief note
> and a dated note. (4) Outward text (DEPENDENCY-POLICY.md, THIRD-PARTY.md, the CHANGELOG
> "Security" line): **keep all three**. (5) The two hidden fixtures, outside this brief:
> **fix now, in its own commit** → `9215dda`. (6) DESIGN-TOKENS.md, the same trap: **commit
> it with the fixtures** → `9215dda`. Commits ran under the autopilot (crw D-22): `9215dda`,
> then the EP-11a commit `05f782b` (the roadmap row's done hash), then the done-hash commit;
> the push is the owner's.
>
> **Residual risk** (for the post-EP-19 re-plan; EP-11b reads the first item back at its
> start): the EP-11a commit's hosted CI, now with 35 fixtures, and the closing of the six
> devalue and source-map-js alerts happen only at the owner's push (expected: green on both
> lanes, 0 open alerts). THIRD-PARTY.md has no CI currency check, so a Dependabot merge that
> moves the runtime closure leaves it stale until a session regenerates it. Weekly Dependabot
> PRs have no reviewer in the roadmap (11 weeks were superseded unreviewed). vitest 5's new
> defaults (mocks cleared before each test; un-awaited assertions fail) apply from EP-12's
> tests on.

> **Handed on (to devenv).** Machine facts from medrecsim EP-11a (2026-11-26), for the
> cross-project memory (its machine file, or a new one). (1) On 2026-11-10
> winget's `OpenJS.NodeJS.LTS` moved this PC from Node 24 to **26.13.1**; Node 25 and later
> ship **no Corepack**. (2) The Corepack shims left in `%APPDATA%\npm` (`pnpm`, `pnpx`, `yarn`,
> `yarnpkg`, each as sh, `.CMD` and `.ps1`) still point at
> `C:\Program Files\nodejs\node_modules\corepack\dist\*.js`, which no longer exists, so `pnpm`
> fails in both bash and PowerShell for every project; removing or replacing them is a
> user-profile change (no elevation) for the owner to decide. (3) A project pinned to Node 24
> with `engine-strict` cannot install under 26; medrecsim moves to 26 in its EP-11b. The
> workaround that worked: the official `node-v24.x-win-x64.zip` from nodejs.org, SHA-256
> checked against that release's `SHASUMS256.txt`, unpacked into the session's scratchpad,
> `corepack enable pnpm` run with that `node.exe` first on PATH (the shim lands beside it), and
> `COREPACK_ENABLE_DOWNLOAD_PROMPT=0` set for non-interactive runs.
