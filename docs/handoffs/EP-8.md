# EP-8 handoff — Toolchain bootstrap + ADRs

**Status:** in progress — local work complete and verified; owner decisions and the post-push
verification (CI on both OSes, Pages, required checks, CodeQL first scan, the two failure
demos) are recorded in the sections marked *post-push* once they have run ·
**Date:** 2026-09-04 · **Brief:** roadmap/EP-8-toolchain.md · **Commits:** *(filled at
completion)*

## Completed scope IDs

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
   references SHA-pinned with tag comments (`scripts/check-action-pins.mjs` enforces in CI);
   `medrecsim/.npmrc` `ignore-scripts=true` (+ pnpm `allowBuilds: {}`, `minimumReleaseAge:
   1440`); `pages.yml` on push to `main` only, `ci` job = the CI workflow, `deploy` job with
   `pages: write` + `id-token: write` only, `github-pages` environment; THIRD-PARTY.md
   regeneration script (`pnpm notices`, `--check` mode) wired into RELEASE-CRITERIA item 5 and
   run now (20-package production closure, 1 bundled).
8. **Dependency policy seeded** — §3 runtime allowlist = `svelte` 5.57.0 only; §4 register of
   16 direct dev dependencies with licences; §5 commands, §8 tool binaries (Node 24.14.1, pnpm
   11.25.0 hash-pinned, gitleaks stay-decision, gh 2.100.0), §11 triggers. Presented to the
   owner (decision 1 below).
9. **Ruleset + baseline** — SECURITY-BASELINE.md: rows A5/A5′ and A7 updated, new section C
   (C1–C13) for the workflow-level items; THREAT-MODEL.md §4 rows B2/B3/B4/B7 flipped to
   landed with the exact controls. Required-checks registration and the `github-pages`
   environment restriction are owner decisions applied *post-push* (decisions 3–4 below).
10. **Pages deploy** — *post-push*; see below.

Also discharged from earlier handoffs: EP-4 (B7 controls, gitleaks successor question, allowlist
seeding, `pages.yml` filename kept so INCIDENT-PROCEDURE §A10 stays valid); EP-5 (`medrecsim`
added to the copy-rule grep path list; the copy rule and disclaimer diff run in CI; the app's
disclaimer test); EP-1 (A7 placeholder, A5 first-scan verification *post-push*); EP-0
(`.gitleaks.toml` reverify note advanced to EP-19).

## Changed files

**New:** `.github/workflows/ci.yml`, `.github/workflows/pages.yml`; `docs/adr/README.md` +
`ADR-1`…`ADR-6`; `docs/handoffs/EP-8.md` (this record); the `medrecsim/` workspace (39 files:
manifests, lockfile, configs, four packages, seven scripts, four placeholder READMEs).

**Modified (outward copy, put to the owner as decision 5):** `README.md` (Quickstart filled:
Pages URL + clone/install/run), `CONTRIBUTING.md` (step 4 describes the real CI), `LICENSE-
CONTENT.md` (directory map → `medrecsim/…` paths + SPDX-header sentence), `.github/CODEOWNERS`
(`/medrecsim/content/`), `THIRD-PARTY.md` (restructured with generator markers; generated
section).

**Modified (governance/config):** `docs/DEPENDENCY-POLICY.md` (status line, §3, §4, §5.1–5.2,
§8, §11), `docs/SECURITY-BASELINE.md` (A5, A5′, A7, section C), `docs/THREAT-MODEL.md` (§4
B2/B3/B4/B7), `docs/RELEASE-CRITERIA.md` (grep path list, disclaimer note, item 5),
`CHANGELOG.md` (Unreleased intro + one Added bullet), `.github/dependabot.yml` (npm directory
`/medrecsim`), `.gitleaks.toml` (reverify note), `medrecsim/README.md` (was empty).

Untouched by design: `DECISIONS.md`, `docs/CLAIMS.md` (row flips happen at the `v0.1.0` tag per
the per-tag checklist; C7 and C8 evidence now exists), `docs/clinical/**`, `roadmap/**` (the
Done-hash follow-up commit is the only roadmap edit, at completion).

## Verification results (2026-09-04, local — Windows 11, Node 24.14.1, pnpm 11.25.0)

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
| Pre-commit hook dry run on the staged set (68 files) | gitleaks "no leaks found"; tripwire passed ✔ |
| EOL / BOM | `git ls-files --eol`: 68 × `i/lf w/lf`; no BOM ✔ |
| Leak screen (paths, usernames, e-mail, AppData) | 0 hits in tracked files (the only match is the generic `%APPDATA%` variable in ADR-4) ✔ |
| Relative links in new/changed Markdown | 21 files, 0 broken (excluding this record while unwritten) ✔ |
| `pull_request_target` / `secrets.` in workflows | none ✔ |

### Post-push verification (recorded after the owner's decision 2)

*Pending.* To be filled: CI run ids and conclusions for `build-test (ubuntu-latest)` and
`build-test (windows-latest)`; Pages deploy run and the live URL with the banner verified;
required checks registered and `docs/rulesets/main-pr-gate.json` re-exported; `github-pages`
environment branch policy; CodeQL `languages` + first analysis; bundle-budget failure demo;
DCO failure demo.

## Chosen framework + validation lib (required by the brief)

- **Svelte 5** (ADR-1): 13.9 KB vs 60.0 KB gz initial JS and 641 ms vs 774 ms throttled
  render against React 19 on an identical accessible component; built-in compile-time a11y
  warnings; equal testing maturity.
- **Zod 4 as source of truth + exported JSON Schema** (ADR-2, I-3 hybrid): inferred TypeScript
  types and working `yaml-language-server` autocomplete from one definition; refinements go to
  the invariant layer.

## Final dependency allowlist (required by the brief)

Runtime (§3): **`svelte` 5.57.0** — that is the whole list. Dev/build (§4): typescript 6.0.3,
vite 8.2.2, vitest 4.1.11, @sveltejs/vite-plugin-svelte 7.3.0, svelte-check 4.7.6, jsdom
30.0.1, fast-check 4.9.0, eslint 10.9.1, @eslint/js 10.0.1, typescript-eslint 8.69.0,
eslint-plugin-svelte 3.23.0, eslint-config-prettier 10.1.8, globals 17.12.0, prettier 3.9.6,
prettier-plugin-svelte 4.1.1, @types/node 24.13.3. Closure: 236 packages; licence mix in
DEPENDENCY-POLICY.md §4 (one MPL-2.0 build-time family, decision 6).

## Measured bundle baseline vs budget (required by the brief)

| | Bytes | Share of 300 KB gz |
|---|---:|---:|
| Initial JS, gzip level 9 (hello-world + banner + engine scaffold) | 10,780 | 3.5 % |
| SP-4 Svelte reference (hello-world + tabs + live region) | 13,919 | 4.5 % |
| SP-4 React reference (same) | 59,985 | 19.5 % |

## `ci.yml` stage list with reserved slots (required by the brief)

1 install · 2 lint/format · 3 typecheck · 4 unit + property tests · **5 slot: content
`validate` + `coverage` (EP-9 / EP-20)** · **6 slot: golden harness (EP-12)** · **7 slot:
component tests (EP-15; folded into 4 for now)** · 8 build + bundle budget + no-network + SPDX
+ claims + action pins · **9 slot: Playwright keyboard-only smoke + axe, ubuntu on PR + windows
nightly (EP-15 / EP-18)** · **10 gitleaks: pre-commit + push protection today; CI step slot
(EP-19)**. Separate jobs: `dco`, `dependency-review` (PR events).

## Reverified version facts (2026-09-04; planning-time values from 2026-08-23 in brackets)

Svelte 5.57.0 [5.56.10] · React 19.2.8 [19.2.x] · Zod 4.5.4 [4.x] · Ajv 8.20.0 [same] · Vite
8.2.2 [8.0.x] · Vitest 4.1.11 chosen; 5.0.0 latest, published 2026-09-03 [4.1.x] · Playwright
1.62.1 [same] · @axe-core/playwright 4.13.0 [same] · yaml 2.9.0 [v2] · pnpm 11.25.0 [11.23.0]
· TypeScript **7.0.2 is latest** (native port) but typescript-eslint (peer `<6.1`) and
svelte-check (peer `^5 || ^6`) do not support it → 6.0.3 · ESLint 10.10.0 published the same
day → 10.9.1 · yaml-language-server 1.24.0 · Node 24.14.1 (LTS). Corepack: bundled with Node
24, removed from Node 25 (ADR-4 revisit trigger).

## Owner decisions (presented interactively; outcomes recorded here)

*Pending — see the decision list in the session's final message until this section is filled.*

1. Runtime dependency allowlist confirmation (`svelte` only) — brief checkpoint, D-EXEC-003.
2. Commit and push the EP-8 work to `main` (runs CI on both OSes).
3. Enable GitHub Pages with the Actions build type and restrict the `github-pages`
   environment to `main` (repository/hosting setting; baseline rows C9/C10).
4. Register the four CI check names as required status checks on `main-pr-gate` (baseline A7)
   and turn on the repository setting "require SHA-pinned actions" (C12).
5. Outward-text edits: README Quickstart, CONTRIBUTING step 4, LICENSE-CONTENT paths,
   CODEOWNERS path, THIRD-PARTY.md restructure.
6. MPL-2.0 build-time exception (`lightningcss`, inside Vite 8) recorded in DEPENDENCY-POLICY
   §4 and allowed in the dependency-review list.
7. Run the two CI failure demos on scratch branches (bundle budget; DCO), then delete them.
8. gitleaks: stay on 8.30.1 until EP-19 (policy §8).

## Decisions logged (reversible technical, D-EXEC-003)

- **Workspace root is `medrecsim/`** (manifests, lockfile, `.npmrc`, `.nvmrc`, configs), not
  the repository root: A-001/I-1 keep code under `medrecsim/`, and the governance tree stays
  free of tooling files. Consequences: Dependabot npm `directory: /medrecsim`; CI
  `working-directory: medrecsim`; LICENSE-CONTENT paths prefixed.
- **pnpm provisioned by Corepack**, hash in `packageManager`; no `pnpm/action-setup`. On the
  owner's machine `corepack enable` needed `--install-directory %APPDATA%\npm` (Program Files
  is not user-writable); documented in ADR-4 and the workspace README.
- **Vitest 4.1.11 and ESLint 10.9.1** instead of the same-day Vitest 5.0.0 / ESLint 10.10.0:
  pnpm's `minimumReleaseAge` would refuse them, and a day-old major is not worth the risk.
- **TypeScript 6.0.3**, not 7.0.2 (ecosystem peer ranges).
- **Node 24 native type stripping** runs the content CLI (`erasableSyntaxOnly` enforced) — no
  `tsx`/`ts-node` dependency.
- **CSP as a build-only `<meta>`** injected by a Vite plugin (the dev server injects styles at
  runtime, which `style-src 'self'` would block); `frame-ancestors` omitted (ignored in meta
  form). Module-preload polyfill disabled so no `fetch` exists in the bundle.
- **`bundle-manifest.json`** emitted into `dist/` by the build; consumed by the notices script
  for the "Bundled" column. Small, public, harmless if served.
- **Disclaimer stored as JSON** (`disclaimer.json`) so both the app and the CI script read one
  artifact without parsing TypeScript.
- **DCO check scope:** pull requests (and `workflow_dispatch` on a branch). Pushes to `main`
  are not checked — the owner's trunk commits are unsigned and D-EXEC-002 sessions commit
  directly; contributors' PRs must sign off. Reversible: add `push` to the job's `if`.
- **`dependency-review-action` allow-list** = policy §6.2 SPDX ids + CC-BY-4.0, BlueOak-1.0.0,
  Python-2.0 (common permissive transitive licences) + MPL-2.0 (decision 6).
- **Vite `base: './'`** (relative) — works on Pages and locally; EP-15 may switch to an absolute
  base if routing needs it.
- **`allow-licenses` includes MIT-0 and 0BSD**; `fail-on-severity: low`.
- **Engine `exports` points at TypeScript source** (`./src/index.ts`) — workspace-internal,
  no build step for libraries; Vite/Vitest resolve it directly.
- **ADR format**: status/date/decides/reversibility header, context, evidence, decision,
  consequences. Supersession by new dated record.

## Risks / notes for the next session

- **`.gitignore` `*token*` pattern** (EP-0 layer 2) will silently ignore a future
  `tokens.ts`/`tokens.css` design-token file — EP-10 must name the file differently (e.g.
  `design-vars.css`) or add a negation line; flagged here so it is not discovered as "file
  missing in CI".
- **Corepack removal in Node 25**: when the LTS line moves, follow the ADR-4 revisit trigger.
- **`minimumReleaseAge` and Dependabot**: a Dependabot PR that bumps to a version younger than
  one day will fail CI's install until the version ages; re-run the job the next day rather
  than adding an exclusion.
- **Runtime verification of B7** (network interception on the deployed page) is still owed by
  EP-15/EP-19; the EP-8 control is static.
- **Peer-injected `@typescript-eslint/types`** appears in svelte's production closure (an
  optional peer pnpm auto-installs); it is compile-time only and not bundled. Cosmetic.
- **Windows lane**: verified locally on Windows; the hosted-runner result is recorded
  *post-push*. Any `corepack enable` failure on `windows-latest` would be the first thing to
  check (fallback: `npm install -g pnpm@11.25.0`, then add integrity pinning).
- **`typescript` 6.0.3 is the last JS-based line**; when typescript-eslint and svelte-check
  support 7.x, bump in one PR (faster typecheck).

## Parked → final-roadmap.md

None. No tooling wishlist items arose that are not already reserved slots.

## Next eligible EPs

**EP-9** (content schema v0 — depends on EP-8 + EP-7, both done once this handoff is complete),
**EP-10** (visual identity — depends on EP-3 + EP-8), and **EP-15** becomes eligible after
EP-10. EP-9 inherits: `zod` and `yaml` additions to the dev register, the exported-JSON-Schema
drift check, the `compile` step and CI stage-5 slot, SPDX headers on content YAML.
