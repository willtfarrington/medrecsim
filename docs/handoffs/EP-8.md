# EP-8 handoff — Toolchain bootstrap + ADRs

**Status:** complete — all nine owner decisions ruled 2026-09-04 (see "Owner decisions"); no
open follow-ups · **Date:** 2026-09-04 · **Brief:** roadmap/EP-8-toolchain.md · **Commits:**
`bee0acb` (workspace, ADRs, workflows, governance updates, hello-world, handoff draft),
`1a5aca8` (handoff completion, ruleset export, baseline rows, `ci.yml` trigger tweak, roadmap
done-hash), plus the closing commit (Dependabot ignore rules, decision 9).

## Completed scope IDs

All ten in-scope items.

1. **SP-4 bundle-floor spike** — Svelte 5.57.0 vs React 19.2.8, identical Vite 8.2.2 config,
   hello-world + WAI-ARIA tabs + live-region announcer; gzip/brotli sizes and throttled CDP
   timings (4× CPU, Fast-3G, gzip-served, median of 7). Table in ADR-1.
2. **SP-5 schema-lib spike** — Zod 4.5.4 `z.toJSONSchema` (draft-7 and 2020-12) → Ajv 8.20.0
   agreement on 10/10 fixtures; `yaml-language-server` 1.24.0 driven over LSP: property
   completions, enum-value completions, and diagnostics all working from the exported schema.
   Refinements are silently dropped on export (documented). Results in ADR-2.
3. **Six ADRs** in `docs/adr/` with an index: ADR-1 Svelte 5 · ADR-2 Zod 4 + exported JSON
   Schema (I-3 hybrid) · ADR-3 build-time content compile · ADR-4 pnpm via Corepack · ADR-5 no
   UI state library · ADR-6 fast-check.
4. **Workspace under `medrecsim/`** — pnpm workspace root; `packages/engine` (event-sourced
   `replay` fold + fast-check replay-equivalence property), `packages/schema` (scaffold),
   `packages/content-tools` (CLI skeleton running on Node 24's native type stripping, no loader
   dependency), `packages/app` (Svelte 5 + Vite); `content/formulary`, `content/cases`,
   `tests/golden`, `tests/e2e` with README placeholders. TypeScript 6.0.3 strict
   (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`), Vite
   8.2.2, Vitest 4.1.11 (workspace projects), ESLint 10.9.1 flat config with a named
   `medrecsim/engine-determinism` block (no `Date`/`Math.random`/`performance`/timers/async/
   `Promise`/DOM globals/`yaml`/`svelte`/`node:*` imports in `packages/engine/src`), Prettier
   3.9.6 (+ Svelte plugin).
5. **Hello-world app** rendering the persistent synthetic/no-affiliation banner: the standing
   disclaimer is stored once in `packages/app/src/disclaimer.json` and asserted byte-equal to
   the CLAIMS.md canonical block by a Vitest test **and** by the CI claims check. Production
   `index.html` carries the same-origin CSP meta (boundary B7); a build plugin writes
   `bundle-manifest.json` naming the npm packages actually bundled. Initial bundle **10,780 B
   gzipped = 3.5 % of the 300 KB budget**.
6. **`ci.yml`** — install (frozen lockfile) → lint → format → typecheck → unit/property tests
   → build → bundle budget → no-network → SPDX → claims → action pins, matrix ubuntu +
   windows; `dco` and `dependency-review` jobs on pull requests; `workflow_call` so `pages.yml`
   can gate on it; no secrets; `pull_request` only; slots for stages 5–7 and 9–10 marked in
   comments. Check names: `build-test (ubuntu-latest)`, `build-test (windows-latest)`, `dco`,
   `dependency-review`.
7. **W4 cross-hooks** — DCO check (`scripts/check-dco.mjs`, ~50 lines, no app);
   `actions/dependency-review-action` with the policy §6.2 licence allow-list; all 7 action
   references SHA-pinned with tag comments (`scripts/check-action-pins.mjs` enforces in CI,
   and the repository now *requires* SHA pins server-side); `medrecsim/.npmrc`
   `ignore-scripts=true` (+ pnpm `allowBuilds: {}`, `minimumReleaseAge: 1440`); `pages.yml`
   on push to `main` only, `ci` job = the CI workflow, `deploy` job with `pages: write` +
   `id-token: write` only, `github-pages` environment restricted to `main`; THIRD-PARTY.md
   regeneration script (`pnpm notices`, `--check` mode) wired into RELEASE-CRITERIA item 5 and
   run now (20-package production closure, 1 bundled).
8. **Dependency policy seeded** — §3 runtime allowlist = `svelte` 5.57.0 only (owner-confirmed
   2026-09-04); §4 register of 16 direct dev dependencies with licences and the MPL-2.0
   build-time exception; §5 commands, §8 tool binaries (Node 24.14.1, pnpm 11.25.0
   hash-pinned, gitleaks stay-decision, gh 2.100.0), §11 triggers.
9. **Ruleset + baseline** — required status checks registered on `main-pr-gate` (A7; live
   export re-committed), CodeQL first scan verified (A5′), SECURITY-BASELINE.md section C
   (C1–C13, all ✅ with dated read-backs), THREAT-MODEL.md §4 rows B2/B3/B4/B7 landed and the
   EP-8 revisit trigger marked done.
10. **Pages deploy** — live at https://willtfarrington.github.io/medrecsim/ with the banner
    (verification below).

Also discharged from earlier handoffs: EP-4 (B7 controls, gitleaks successor question, allowlist
seeding, `pages.yml` filename kept so INCIDENT-PROCEDURE §A10 stays valid); EP-5 (`medrecsim`
added to the copy-rule grep path list; the copy rule and disclaimer diff run in CI; the app's
disclaimer test); EP-1 (A7 placeholder, A5 first-scan verification); EP-0 (`.gitleaks.toml`
reverify note advanced to EP-19).

## Changed files

**New:** `.github/workflows/ci.yml`, `.github/workflows/pages.yml`; `docs/adr/README.md` +
`ADR-1`…`ADR-6`; `docs/handoffs/EP-8.md` (this record); the `medrecsim/` workspace (39 files:
manifests, lockfile, configs, four packages, seven scripts, four placeholder READMEs).

**Modified (outward copy, owner decision 5 — keep):** `README.md` (Quickstart filled: Pages URL
+ clone/install/run), `CONTRIBUTING.md` (step 4 describes the real CI), `LICENSE-CONTENT.md`
(directory map → `medrecsim/…` paths + SPDX-header sentence), `.github/CODEOWNERS`
(`/medrecsim/content/`), `THIRD-PARTY.md` (restructured with generator markers; generated
section).

**Modified (governance/config):** `docs/DEPENDENCY-POLICY.md` (status line, §3, §4, §5.1–5.2,
§8, §11), `docs/SECURITY-BASELINE.md` (A5, A5′, A7, section C), `docs/THREAT-MODEL.md` (§4
B2/B3/B4/B7; §7 trigger 5 marked done), `docs/RELEASE-CRITERIA.md` (grep path list, disclaimer
note, item 5), `docs/rulesets/main-pr-gate.json` (live export with the new
`required_status_checks` rule), `CHANGELOG.md` (Unreleased intro + one Added bullet),
`.github/dependabot.yml` (npm directory `/medrecsim`; ignore rules for `typescript` and
`@types/node` majors, decision 9), `.gitleaks.toml` (reverify note),
`medrecsim/README.md` (was empty), `roadmap/README.md` (Done column).

Untouched by design: `DECISIONS.md`, `docs/CLAIMS.md` (row flips happen at the `v0.1.0` tag per
the per-tag checklist; C7 and C8 evidence now exists), `docs/clinical/**`, the roadmap briefs.

## Verification results

### Local (2026-09-04 — Windows 11, Node 24.14.1, pnpm 11.25.0)

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | 236 packages, 0 lifecycle scripts run, "Already up to date" on re-run ✔ |
| `pnpm lint` (ESLint 10, incl. Svelte + determinism rule) | clean ✔ |
| `pnpm format:check` (Prettier) | clean ✔ |
| `pnpm typecheck` (tsc ×3, svelte-check `--fail-on-warnings`) | 0 errors, 0 warnings ✔ |
| `pnpm test` (Vitest: engine node env, app jsdom) | 3 files, 5 tests passed, incl. the fast-check property and the CLAIMS.md byte-equality test ✔ |
| `pnpm build` (Vite 8) | `index.html` 0.93 kB, CSS 0.83 kB, JS 26.34 kB raw ✔ |
| `check:budget` | initial JS **10,780 B gz = 3.5 %** of 307,200 B ✔ |
| `check:no-network` | CSP present with all 5 required directives; no network APIs / off-origin URLs ✔ |
| `check:spdx` | 22 files carry the expected identifier ✔ |
| `check:claims` | copy rule clean; disclaimer identical in CLAIMS.md, README.md, app ✔ |
| `check:action-pins` | 7 references, all 40-hex SHA + tag comment ✔ |
| `pnpm notices` / `--check` | regenerated; "THIRD-PARTY.md is current" ✔ |
| `check-dco.mjs HEAD~2..HEAD` | correctly **fails** on the repository's existing unsigned commits (the check applies to pull requests; owner trunk commits have never carried sign-off) ✔ |
| Content CLI | `node packages/content-tools/src/cli.ts` prints usage (exit 2); `validate` reports "arrives with EP-9" ✔ |
| Pre-commit hook on the real commit (68 files) | gitleaks "no leaks found"; tripwire passed ✔ |
| EOL / BOM | `git ls-files --eol`: 68 × `i/lf w/lf`; no BOM ✔ |
| Leak screen (paths, usernames, e-mail, AppData) | 0 hits in tracked files (the only match is the generic `%APPDATA%` variable in ADR-4) ✔ |
| Relative links in new/changed Markdown | 21 files, 0 broken ✔ |
| `pull_request_target` / `secrets.` in workflows | none ✔ |

### Post-push (2026-09-04, hosted runners; `gh` read-backs)

| Item | Evidence |
|---|---|
| **CI green on both OSes on `main`** | Pages run **33916677177** (push `bee0acb`): `ci / build-test (ubuntu-latest)` success · `ci / build-test (windows-latest)` success · `deploy` success (`dco` and `dependency-review` skipped by design on push events) ✔ |
| **Pages hello-world live with the banner** | `GET https://willtfarrington.github.io/medrecsim/` → HTTP 200; `<meta http-equiv="Content-Security-Policy">` present; the served `assets/index-*.js` (26,341 B) contains the standing disclaimer exactly once and the banner lead line ✔ |
| **Pages settings** | `build_type: workflow`, `public: true`, `https_enforced: true`; environment `github-pages` deployment-branch policy = `main` only (custom branch policies, one entry) ✔ |
| **Bundle-budget job demonstrably fails** | `scratch/bundle-budget-demo` (incompressible ~478 KB constant referenced from `main.ts`) → run **33917083279**: `Bundle budget` step failed on both lanes — "Initial JS: 371,804 B gzipped = 121.0 % of the 307,200 B budget → FAIL". Branch deleted (remote + local). Note: a first attempt that only logged `OVERSIZED.length` was constant-folded away by the minifier and still passed — the fixture must reach the DOM ✔ |
| **DCO check demonstrably fails** | `scratch/dco-demo` (one unsigned commit) + `workflow_dispatch` of `ci.yml` → run **33916772806**: `dco` job failed naming the commit ("1 commit(s) lack a Signed-off-by line"); on the same run both build-test lanes passed. Branch deleted. On Dependabot PR #1 (signed-off) the job passed ✔ |
| **Required status checks** | Ruleset 21252020 `main-pr-gate` now has `required_status_checks` = the four contexts (non-strict); read-back rules `["pull_request","required_status_checks"]`; stripped export committed; PR #1 shows all four contexts reporting ✔ |
| **SHA pinning required (repo setting)** | `actions/permissions` read-back `sha_pinning_required: true` ✔ |
| **CodeQL first scan (A5′)** | default setup `languages: ["javascript","javascript-typescript","typescript"]`, `schedule: weekly`; "CodeQL Setup" run succeeded; one analysis on `refs/heads/main`, `error: ""`, `results_count: 0` ✔ |
| **No action reference without a full SHA** | `check:action-pins` in CI + server-side setting ✔ · `.npmrc` contains `ignore-scripts=true` ✔ · `pages.yml` triggers only on `push: branches: [main]` ✔ |
| **Dependabot** | Picked up `/medrecsim` immediately and opened PR #1 (see owner follow-up) — the config path change works ✔ |

## Chosen framework + validation lib (required by the brief)

- **Svelte 5** (ADR-1): 13.9 KB vs 60.0 KB gz initial JS and 641 ms vs 774 ms throttled
  render against React 19 on an identical accessible component; built-in compile-time a11y
  warnings; equal testing maturity.
- **Zod 4 as source of truth + exported JSON Schema** (ADR-2, I-3 hybrid): inferred TypeScript
  types and working `yaml-language-server` autocomplete from one definition; refinements go to
  the invariant layer.

## Final dependency allowlist (required by the brief)

Runtime (§3): **`svelte` 5.57.0** — that is the whole list; owner-confirmed 2026-09-04.
Dev/build (§4): typescript 6.0.3, vite 8.2.2, vitest 4.1.11, @sveltejs/vite-plugin-svelte
7.3.0, svelte-check 4.7.6, jsdom 30.0.1, fast-check 4.9.0, eslint 10.9.1, @eslint/js 10.0.1,
typescript-eslint 8.69.0, eslint-plugin-svelte 3.23.0, eslint-config-prettier 10.1.8, globals
17.12.0, prettier 3.9.6, prettier-plugin-svelte 4.1.1, @types/node 24.13.3. Closure: 236
packages; licence mix in DEPENDENCY-POLICY.md §4 (one MPL-2.0 build-time family, owner
decision 6).

## Measured bundle baseline vs budget (required by the brief)

| | Bytes | Share of 300 KB gz |
|---|---:|---:|
| Initial JS, gzip level 9 (hello-world + banner + engine scaffold), as deployed | 10,780 | 3.5 % |
| SP-4 Svelte reference (hello-world + tabs + live region) | 13,919 | 4.5 % |
| SP-4 React reference (same) | 59,985 | 19.5 % |
| Failure demo fixture (for scale) | 371,804 | 121.0 % |

## `ci.yml` stage list with reserved slots (required by the brief)

1 install · 2 lint/format · 3 typecheck · 4 unit + property tests · **5 slot: content
`validate` + `coverage` (EP-9 / EP-20)** · **6 slot: golden harness (EP-12)** · **7 slot:
component tests (EP-15; folded into 4 for now)** · 8 build + bundle budget + no-network + SPDX
+ claims + action pins · **9 slot: Playwright keyboard-only smoke + axe, ubuntu on PR + windows
nightly (EP-15 / EP-18)** · **10 gitleaks: pre-commit + push protection today; CI step slot
(EP-19)**. Separate jobs: `dco`, `dependency-review` (PR events). Triggers: `pull_request`,
`push` to `scratch/**` only, `workflow_call` (from `pages.yml`), `workflow_dispatch`.

## Reverified version facts (2026-09-04; planning-time values from 2026-08-23 in brackets)

Svelte 5.57.0 [5.56.10] · React 19.2.8 [19.2.x] · Zod 4.5.4 [4.x] · Ajv 8.20.0 [same] · Vite
8.2.2 [8.0.x] · Vitest 4.1.11 chosen; 5.0.0 latest, published 2026-09-03 [4.1.x] · Playwright
1.62.1 [same] · @axe-core/playwright 4.13.0 [same] · yaml 2.9.0 [v2] · pnpm 11.25.0 [11.23.0]
· TypeScript **7.0.2 is latest** (native port) but typescript-eslint (peer `<6.1`) and
svelte-check (peer `^5 || ^6`) do not support it → 6.0.3 · ESLint 10.10.0 published the same
day → 10.9.1 · yaml-language-server 1.24.0 · Node 24.14.1 (LTS). Corepack: bundled with Node
24, removed from Node 25 (ADR-4 revisit trigger). gitleaks 8.30.1 stays (EP-19 reverify).

## Owner decisions (presented interactively 2026-09-04; outcomes recorded)

1. **Runtime dependency allowlist** (`svelte` only; brief checkpoint, D-EXEC-003). Options:
   confirm (recommended); hold. **Owner ruling: confirm.** Recorded in DEPENDENCY-POLICY §3.
2. **Commit and push to `main`** (68 files; two-commit pattern; no AI co-author trailer).
   Options: commit and push (recommended); commit locally only; hold. **Owner ruling: commit
   and push.** Pushed as `bee0acb`.
3. **GitHub Pages**: enable with `build_type=workflow` and restrict the `github-pages`
   environment to `main`. Options: enable + restrict (recommended); enable only; do not
   enable. **Owner ruling: enable + restrict.** Applied and read back (baseline C9/C10).
4. **Ruleset/settings**: (a) required status checks on `main-pr-gate`, (b) repository setting
   "require SHA-pinned actions". Options: both (recommended); (a) only; (b) only; neither.
   **Owner ruling: both.** Applied after the first CI run; read backs in baseline A7/C12.
5. **Outward-text edits** (README Quickstart, CONTRIBUTING step 4, LICENSE-CONTENT paths,
   CODEOWNERS path, THIRD-PARTY restructure). Options: keep all five (recommended); keep all
   except README; revert all. **Owner ruling: keep all five.** No new outward claim; README
   wording stays under the C11 status-line softening.
6. **MPL-2.0 build-time exception** (`lightningcss` inside Vite 8). Options: accept
   (recommended); reject. **Owner ruling: accept.** Recorded in DEPENDENCY-POLICY §4 and the
   dependency-review allow-list.
7. **Failure demos** on scratch branches, then delete. Options: run both (recommended); bundle
   only; skip. **Owner ruling: run both.** Done (post-push table); both branches deleted.
8. **gitleaks**: stay on 8.30.1, reverify at EP-19. Options: stay (recommended); migrate now.
   **Owner ruling: stay.** Recorded in DEPENDENCY-POLICY §8 and `.gitleaks.toml`.

9. **Dependabot PR #1** ("Bump the npm-dependencies group in /medrecsim with 2 updates":
   `typescript` 6.0.3 → **7.0.2** and `@types/node` 24.13.3 → **26.4.1**). Both bumps are
   wrong for this toolchain (TypeScript 7 is unsupported by typescript-eslint/svelte-check;
   Node 26 types do not match the pinned Node 24 LTS) and CI correctly failed the PR on both
   lanes; the DCO and dependency-review checks passed on it, a live confirmation of both jobs
   on a real pull request. Options: close with a one-line reason (policy §9) and add
   Dependabot `ignore` rules for the two majors (recommended); leave open. **Owner ruling
   (2026-09-04, end of session): close and add the ignore rules.** Done: PR #1 closed with the
   reason in its comment, branch deleted; `.github/dependabot.yml` now ignores
   `version-update:semver-major` for `typescript` and `@types/node` (minor/patch updates still
   arrive), with the removal condition written beside each rule.

## Decisions logged (reversible technical, D-EXEC-003)

- **Workspace root is `medrecsim/`** (manifests, lockfile, `.npmrc`, `.nvmrc`, configs), not
  the repository root: A-001/I-1 keep code under `medrecsim/`, and the governance tree stays
  free of tooling files. Consequences: Dependabot npm `directory: /medrecsim`; CI
  `working-directory: medrecsim`; LICENSE-CONTENT paths prefixed.
- **pnpm provisioned by Corepack**, hash in `packageManager`; no `pnpm/action-setup`. On the
  owner's machine `corepack enable` needed `--install-directory %APPDATA%\npm` (Program Files
  is not user-writable); documented in ADR-4 and the workspace README. The shims are the only
  machine change this EP made outside the repository.
- **Vitest 4.1.11 and ESLint 10.9.1** instead of the same-day Vitest 5.0.0 / ESLint 10.10.0:
  pnpm's `minimumReleaseAge` would refuse them, and a day-old major is not worth the risk.
- **TypeScript 6.0.3**, not 7.0.2 (ecosystem peer ranges).
- **Node 24 native type stripping** runs the content CLI (`erasableSyntaxOnly` enforced) — no
  `tsx`/`ts-node` dependency.
- **CSP as a build-only `<meta>`** injected by a Vite plugin (the dev server injects styles at
  runtime, which `style-src 'self'` would block); `frame-ancestors` omitted (ignored in meta
  form). Module-preload polyfill disabled so no `fetch` exists in the bundle. Vite HTML-escapes
  the quotes in the meta content; browsers decode them (verified on the live page) and the
  checker decodes entities before comparing.
- **`bundle-manifest.json`** emitted into `dist/` by the build; consumed by the notices script
  for the "Bundled" column. Small, public, harmless if served.
- **Disclaimer stored as JSON** (`disclaimer.json`) so both the app and the CI script read one
  artifact without parsing TypeScript.
- **DCO check scope:** pull requests (and `workflow_dispatch` on a branch). Pushes to `main`
  are not checked — the owner's trunk commits are unsigned and D-EXEC-002 sessions commit
  directly; contributors' PRs must sign off. Reversible: add `push` to the job's `if`.
- **`ci.yml` `push` trigger narrowed to `scratch/**`** after the first Dependabot PR ran twice
  (once for `push`, once for `pull_request`). Feature branches run through their pull request;
  scratch branches still run on push for demos. Applied in the follow-up commit.
- **`dependency-review-action` allow-list** = policy §6.2 SPDX ids + CC-BY-4.0, BlueOak-1.0.0,
  Python-2.0 (common permissive transitive licences) + MPL-2.0 (decision 6);
  `fail-on-severity: low`; `comment-summary-in-pr: never` (no write token).
- **Vite `base: './'`** (relative) — works on Pages and locally; EP-15 may switch to an absolute
  base if routing needs it.
- **Engine `exports` points at TypeScript source** (`./src/index.ts`) — workspace-internal,
  no build step for libraries; Vite/Vitest resolve it directly.
- **Ruleset export hygiene** kept from EP-1 (volatile fields stripped, keys sorted, 4-space
  JSON).
- **ADR format**: status/date/decides/reversibility header, context, evidence, decision,
  consequences; supersession by a new dated record.

## Risks / notes for the next session

- **`.gitignore` `*token*` pattern** (EP-0 layer 2) will silently ignore a future
  `tokens.ts`/`tokens.css` design-token file — EP-10 must name the file differently (e.g.
  `design-vars.css`) or add a negation line; flagged here so it is not discovered as "file
  missing in CI".
- **Corepack removal in Node 25**: when the LTS line moves, follow the ADR-4 revisit trigger.
- **`minimumReleaseAge` and Dependabot**: a Dependabot PR that bumps to a version younger than
  one day will fail CI's install until the version ages; re-run the job the next day rather
  than adding an exclusion. Dependabot also ignores `engines`/peer ranges (PR #1), so CI is the
  gate, not the bot.
- **Runtime verification of B7** (network interception on the deployed page) is still owed by
  EP-15/EP-19; the EP-8 control is static. CLAIMS rows C7/C8 flip at the `v0.1.0` tag.
- **Peer-injected `@typescript-eslint/types`** appears in svelte's production closure (an
  optional peer pnpm auto-installs); it is compile-time only and not bundled. Cosmetic.
- **Windows lane** verified on the hosted runner (three green runs); `corepack enable` worked
  there without a custom install directory.
- **`typescript` 6.0.3 is the last JS-based line**; when typescript-eslint and svelte-check
  support 7.x, bump in one PR (faster typecheck) and remove the Dependabot ignore rule in the
  same change (decision 9).
- **Vitest under jsdom is slow to boot** (~30 s locally for one file) — acceptable now; EP-15
  may switch the app project to `happy-dom` if it grows.

## Parked → final-roadmap.md

None. No tooling wishlist items arose that are not already reserved slots.

## Next eligible EPs

**EP-9** (content schema v0 — depends on EP-8 + EP-7, both done) and **EP-10** (visual
identity — depends on EP-3 + EP-8) are eligible now; **EP-15** follows EP-10. EP-9 inherits:
`zod` and `yaml` additions to the dev register, the exported-JSON-Schema drift check, the
`compile` step and CI stage-5 slot, SPDX headers on content YAML.
