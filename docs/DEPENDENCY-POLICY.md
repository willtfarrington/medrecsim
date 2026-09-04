# Dependency policy (D-SEC-002)

**Status:** policy current as of 2026-09-04 (EP-8: §3 and §4 seeded from the toolchain
bootstrap, §5 and §8 updated to pnpm/Corepack and Node 24.14.1, gitleaks decision recorded) ·
**Owner:** repository owner · **Revisit trigger:** §9 and §11.

This document implements the dependency half of D-SEC-002 and is the detailed control for trust
boundary **B4 (dependencies → build)** in [THREAT-MODEL.md](THREAT-MODEL.md). It exists because a
dependency is the one thing that runs *inside* the build with the build's authority, bypassing
the review path that every other input goes through. The verified state of the related server
settings (Dependabot alerts, CodeQL, workflow permissions) is recorded in
[SECURITY-BASELINE.md](SECURITY-BASELINE.md); a suspected compromise is handled by
[INCIDENT-PROCEDURE.md](INCIDENT-PROCEDURE.md) §A and §C. Data dependencies are a different
question with a different answer: restricted datasets are never a dependency of any kind
([MIMIC-GATE.md](MIMIC-GATE.md)).

## 1. Presumption: minimal dependencies

The default answer to "should we add a dependency?" is **no**. A dependency is added only when
all of the following hold and are written down in the table it joins:

- the problem is real, present now, and not solvable in a small amount of owned code;
- the package is the narrowest thing that solves it (no frameworks for utilities);
- the checklist in §6 passes;
- for **runtime** dependencies, the owner has approved the addition (D-EXEC-003: runtime
  dependencies beyond the allowlist are owner-only, never delegated).

Justifications are written *per dependency*, in this file, at the time of adding. "Everyone
uses it" is not a justification; "the accessible-widget primitives it provides would take weeks
to reimplement to WCAG 2.2 AA and are the ADR-1 measured choice" is.

## 2. Classes of dependency

| Class | Definition | Governing rule |
|-------|-----------|----------------|
| **Runtime** | Any package whose code ships in the bundle served from GitHub Pages | Allowlist in §3; additions owner-only; each row justified; counted against the bundle budget (≤ ~300 KB gzipped initial JS, D-ARCH-007) |
| **Build / dev** | Compilers, bundlers, test runners, linters, formatters, type definitions, content-tooling packages that run in CI or on the owner's machine but never ship | Register in §4; agent-addable when the §6 checklist passes and the addition is logged in the EP handoff; still subject to frozen installs and `ignore-scripts` |
| **GitHub Actions** | Workflow steps pulled from the Marketplace or other repositories | §7: full-length commit SHA pins only; official (`actions/*`, `github/*`) preferred; minimal per-job permissions |
| **Tool binaries** | Native tools the workflow relies on but npm does not manage: Node LTS, gitleaks, `gh`, `git-filter-repo` | §8: version recorded; install source recorded; reverified at each R-phase boundary |
| **Source material** | Reference texts and assets, not code | Not governed here; see `source material/REGISTRY.md` (D-DATA-006) |

Transitive dependencies are dependencies. A direct package that drags in forty transitive
packages is evaluated as forty-one packages.

## 3. Runtime dependency allowlist

*Seeded at EP-8 (2026-09-04) from what the toolchain bootstrap actually installed and
presented to the owner for confirmation (EP-8 owner checkpoint). Exactly one runtime package
ships; workspace packages (`@medrecsim/engine`, `@medrecsim/schema`) are owned code, not
dependencies.*

| Package | Pinned version | Purpose and why owned code will not do | Licence | Install scripts | Gzipped contribution | Registry / THIRD-PARTY row | Approved (date) |
|---------|---------------|----------------------------------------|---------|-----------------|----------------------|----------------------------|-----------------|
| `svelte` | 5.57.0 | UI framework chosen by measurement in [ADR-1](adr/ADR-1-ui-framework.md) (SP-4). Reactive rendering, compile-time accessibility warnings, and the component model are not something a solo maintainer should hand-write to WCAG 2.2 AA. No network I/O. The compiler's own dependency closure (acorn, magic-string, …) is compile-time only and does not ship (the build's `bundle-manifest.json` lists exactly which packages are bundled). | MIT | none (blocked by `allowBuilds: {}`) | 10,780 B gz for the *entire* initial bundle at hello-world (app code included; whole-bundle figure re-measured by `check:budget` on every build) | THIRD-PARTY.md generated row | 2026-09-04 — owner confirmation recorded in the EP-8 handoff |

Rules specific to this table:

- Every row names the ADR that chose it where one exists (ADR-1 framework, ADR-2 validation
  library; see EP-8).
- The "Gzipped contribution" column is re-measured whenever the bundle-budget CI check moves by
  more than a trivial amount, and at every tagged release.
- Removing a row needs no approval; adding or replacing one does.
- No runtime dependency may perform network I/O. Boundary B7 (no network at runtime) is
  enforced by CSP and a CI invariant regardless, but a dependency whose *purpose* is network
  I/O fails this policy before it reaches that test.

## 4. Build and development dependency register

*Seeded at EP-8 (2026-09-04).* Direct development dependencies only; the full closure (236
packages in `medrecsim/pnpm-lock.yaml`) is reviewed through the lockfile diff at each update.
"Install scripts" is *none run* for every row: pnpm blocks lifecycle scripts by default and the
allow-list is empty (ADR-4). Dev tooling is not redistributed, so it has no THIRD-PARTY row
(THIRD-PARTY.md says so in its "Development-time tooling" section). Manifest: `medrecsim/`
(root) unless noted.

| Package | Pinned version | Purpose | Licence | Install scripts | THIRD-PARTY row | Logged in |
|---------|---------------|---------|---------|-----------------|-----------------|-----------|
| `typescript` | 6.0.3 | Compiler / typechecker (6.x chosen over 7.0.2 because `typescript-eslint` and `svelte-check` do not yet support 7) | Apache-2.0 | none run | — | EP-8 |
| `vite` | 8.2.2 | Bundler and dev server (ADR-1/ADR-3) | MIT | none run | — | EP-8 |
| `vitest` | 4.1.11 | Test runner (4.x chosen over the day-old 5.0.0 major; `minimumReleaseAge`) | MIT | none run | — | EP-8 |
| `@sveltejs/vite-plugin-svelte` (app) | 7.3.0 | Svelte compiler integration for Vite | MIT | none run | — | EP-8 |
| `svelte-check` (app) | 4.7.6 | Typechecks `.svelte` files (`--fail-on-warnings` includes the compiler's a11y warnings) | MIT | none run | — | EP-8 |
| `jsdom` (app) | 30.0.1 | DOM for component tests under Vitest | MIT | none run | — | EP-8 |
| `fast-check` (engine) | 4.9.0 | Property-based tests ([ADR-6](adr/ADR-6-property-test-library.md)) | MIT | none run | — | EP-8 |
| `eslint` | 10.9.1 | Linter (10.9.1 chosen over same-day 10.10.0; `minimumReleaseAge`) | MIT | none run | — | EP-8 |
| `@eslint/js` | 10.0.1 | ESLint recommended rule set | MIT | none run | — | EP-8 |
| `typescript-eslint` | 8.69.0 | TypeScript parser + rules for ESLint | MIT | none run | — | EP-8 |
| `eslint-plugin-svelte` | 3.23.0 | Svelte rules for ESLint (incl. a11y) | MIT | none run | — | EP-8 |
| `eslint-config-prettier` | 10.1.8 | Disables formatting rules that conflict with Prettier | MIT | none run | — | EP-8 |
| `globals` | 17.12.0 | Browser / Node global declarations for ESLint | MIT | none run | — | EP-8 |
| `prettier` | 3.9.6 | Formatter | MIT | none run | — | EP-8 |
| `prettier-plugin-svelte` | 4.1.1 | Svelte support for Prettier | MIT | none run | — | EP-8 |
| `@types/node` | 24.13.3 | Node type definitions (scripts, content-tools) | MIT | none run | — | EP-8 |

**Licence notes on the transitive closure (2026-09-04):** 163 MIT, 19 Apache-2.0, 10 BSD-2-Clause,
9 ISC, 3 BSD-3-Clause, 2 BlueOak-1.0.0, 2 MIT-0, 1 CC0-1.0, **2 MPL-2.0** (`lightningcss` and
its Windows binary — Vite 8's built-in CSS transformer, build-time only, never redistributed;
accepted as a documented exception to §6.2's copyleft rule for *build tooling* by the owner at
EP-8, see the handoff), and 25 platform-specific binary packages (`@rolldown/binding-*`,
`lightningcss-*`, `fsevents`) that declare no `license` field in their own manifest but are
published under their parent package's licence (MIT / MPL-2.0 respectively). The
`dependency-review-action` allow-list in `ci.yml` mirrors this: §6.2's permissive set plus
`MPL-2.0` for that one build-time family.

## 5. Installation and lockfile rules

1. **The lockfile is committed and authoritative.** CI and every fresh clone install with the
   frozen-lockfile command: `pnpm install --frozen-lockfile` from `medrecsim/` (package
   manager decided in [ADR-4](adr/ADR-4-package-manager.md); the lockfile is
   `medrecsim/pnpm-lock.yaml`). A lockfile change is a reviewable diff, never a side effect.
2. **Install scripts are disabled**: `medrecsim/.npmrc` carries `ignore-scripts=true`, and
   `medrecsim/pnpm-workspace.yaml` keeps pnpm's lifecycle-script allow-list empty
   (`allowBuilds: {}`). A package that genuinely needs a build step at install time is either
   avoided or has that step approved by name there and reviewed, with the reason recorded in
   its row. The same file sets `minimumReleaseAge: 1440`: a version published less than one
   day ago cannot be installed, transitively included.
3. **One registry.** Packages come from the default public npm registry. No git URLs, no
   tarball URLs, no private or mirror registries, no `file:` links to paths outside the
   workspace.
4. **No unpinned execution.** CI never runs `npx <package>` or a `curl | sh` style installer
   against an unpinned version. Tools run from the lockfile or from a SHA-pinned action.
5. **Exact versions for direct dependencies** in the manifests where the package manager
   allows it; ranges are the lockfile's job, not the manifest's.
6. **Provenance when offered.** Where the registry shows a build-provenance attestation for the
   chosen version, the reviewer notes it; its absence is not disqualifying but is recorded.

## 6. New-dependency checklist

Copied into the PR description or the EP handoff entry that adds the package. All items are
answered, not ticked.

1. **Need.** What breaks or what is not built without it? What is the owned-code alternative
   and why is it worse?
2. **Licence.** Permissive and compatible with MIT (code) and CC BY 4.0 (content): MIT, BSD,
   ISC, Apache-2.0, 0BSD, Unlicense, CC0, or OFL for fonts. Copyleft, source-available, or
   "non-commercial" licences fail. Dual-licensed packages are recorded under the licence
   actually relied on.
3. **Maintenance health.** Last release and last meaningful commit within roughly the past
   year; issues get responses; more than one person can publish, or the bus-factor is
   acknowledged in the row. Archived or "looking for maintainers" projects fail for runtime use.
4. **Install scripts.** `preinstall`, `install`, `postinstall`, `prepare` present? If yes, what
   do they do, and is the package still acceptable with scripts ignored (§5.2)?
5. **Size versus budget.** Runtime only: gzipped contribution measured in the real bundle
   against the ~300 KB budget (D-ARCH-007) and recorded in the row.
6. **Transitive footprint.** How many new packages enter the lockfile? Any of them with install
   scripts, network access, or unusual publishers?
7. **Identity.** Exact package name checked against typosquats; publisher matches the project's
   known maintainers; the version being added is the one the registry lists as latest stable or
   a deliberate pin with a reason.
8. **Network behaviour.** Does the package, or anything it pulls in, make network calls at
   runtime? If yes, it cannot be a runtime dependency (§3).
9. **Registry and notices.** THIRD-PARTY.md is regenerated (EP-8 script) so the licence text
   ships; if the package redistributes third-party assets (fonts, icon sets, data), a
   `source material/REGISTRY.md` row is added (D-DATA-006).
10. **Owner approval** for runtime dependencies (D-EXEC-003), recorded with a date in the §3
    row.

## 7. GitHub Actions

- Every `uses:` reference is pinned to a **full-length commit SHA**, with the human-readable tag
  in a trailing comment. Tag and branch references fail review; the EP-8 acceptance check greps
  for this.
- Prefer official actions (`actions/checkout`, `actions/setup-node`, `actions/deploy-pages`,
  `actions/dependency-review-action`, `github/codeql-action`). A third-party action needs the
  §6 checklist like any package, plus a read of its source at the pinned SHA.
- The Dependabot `github-actions` ecosystem (configured at EP-2) keeps pins fresh through the
  same weekly, grouped, reviewed-never-auto-merged flow as npm.
- Workflow permissions: repository default is read-only (baseline row A8); each job declares
  only what it needs; `pages: write` and `id-token: write` appear only on the Pages deploy job;
  no secrets are defined in the repository at all (boundary B2).
- `pull_request_target` is never combined with a checkout of fork code (baseline row A10).

## 8. Tool binaries

| Tool | Version in use | Source | Role | Reverify |
|------|----------------|--------|------|----------|
| Node.js | **24.14.1** (LTS "Krypton"; `medrecsim/.nvmrc` and `engines.node >=24.14.1 <25`, `engine-strict=true`) | nodejs.org / winget | Toolchain runtime; CI installs the same version from `.nvmrc` via `actions/setup-node` | Each R-phase boundary (next: EP-19) |
| pnpm | **11.25.0**, SHA-512 of the tarball pinned in `medrecsim/package.json#packageManager` | Provisioned by **Corepack** (bundled with Node 24; `corepack enable` once per machine, or `corepack pnpm …`) — no global install, no third-party action | Package manager ([ADR-4](adr/ADR-4-package-manager.md)); a hash-pinned download is not "unpinned execution" under §5.4 | Each R-phase boundary; **when the Node LTS line moves past 24** (Node 25 dropped Corepack) provisioning switches to a lockfile-pinned `corepack` package or a hash-verified pnpm download in CI |
| gitleaks | 8.30.1 (pinned in `.gitleaks.toml`) | winget `Gitleaks.Gitleaks` | Pre-commit secret scan (boundary B5) | **EP-8 decision (2026-09-04): stay on 8.30.1.** The binary works, the default ruleset still receives security patches upstream, and the successor project had not published a stable release with a verified-compatible ruleset format at the time of checking; migrating now would trade a working control for churn. Next reverification: **EP-19** (the `v0.1.0` tag), then each R-phase boundary. Migration trigger: a gitleaks advisory without a patch, or the successor reaching a stable release that reads `.gitleaks.toml` unchanged. |
| GitHub CLI (`gh`) | 2.100.0 (2.98.0 at EP-1; updated by winget) | winget `GitHub.cli` | Baseline verification, ruleset export, incident runbook | Each R-phase boundary |
| git | 2.55.0 | Git for Windows | Everything; `git-filter-repo` needs ≥ 2.36 | Each R-phase boundary |
| git-filter-repo | Not installed by default; installed only when INCIDENT-PROCEDURE §A is executed | `pip install git-filter-repo` or the single-file script from the upstream repository | History rewrite (needs ≥ 2.47 for `--sensitive-data-removal`) | At use |

No tool binary is committed to the repository. Versions are recorded here and in
SECURITY-BASELINE.md so that a "works on my machine" difference can be diagnosed.

## 9. Update cadence and review

**Weekly, grouped, reviewed, never auto-merged.** Dependabot opens at most five PRs per
ecosystem per week (`.github/dependabot.yml`, EP-2). There is deliberately no auto-merge
workflow, and Actions cannot approve PRs (baseline row A9). Reviewing a Dependabot PR means:

1. Read the grouped changelog links; look for licence changes, new install scripts, new
   maintainers, and major-version behaviour changes.
2. Diff the lockfile: every *new* transitive package gets a glance at name, publisher, and
   scripts.
3. CI green on both operating systems (EP-8 matrix), including the bundle-budget check.
4. Merge or close with a one-line reason. A closed update is revisited the following week; a
   security advisory is not closed without a written accepted-risk note.

Where a major version is known to be unusable for a stated reason, `.github/dependabot.yml`
carries an `ignore` rule for that major with the reason and the removal condition written
beside it, so the weekly review is not spent re-closing the same PR. Current rules (EP-8,
2026-09-04): `typescript` majors (7.x unsupported by typescript-eslint and svelte-check) and
`@types/node` majors (tracks the pinned Node LTS line). Each rule is removed in the same change
that lifts its reason.

**Security advisories** (Dependabot alerts, baseline row A4) are triaged on a best-effort
basis with no SLA (SUPPORT.md, SECURITY.md). Resolution options in order of preference: update,
pin to a fixed version, remove the dependency, or record an accepted risk in
SECURITY-BASELINE.md with the reason and a re-check date. An advisory affecting a *runtime*
dependency with a plausible path to a learner's browser is treated as a vulnerability under
INCIDENT-PROCEDURE.md §C.

**Annual audit**, aligned with the annual content re-review (D-GOV-001, D-RISK-005) so that
there is exactly one recurring obligation, not two: re-read §3 and §4 row by row; remove
anything unused; confirm each maintenance-health answer is still true; regenerate
THIRD-PARTY.md; re-measure the bundle; update the status line of this document. The audit is
also part of the EP-38 release audit (gate 6: THIRD-PARTY regenerated, registry complete).

## 10. Removal

Dependencies are removed when they stop earning their row: the feature was cut, owned code
replaced them, or maintenance health failed. Removal is a normal PR with the row deleted and
THIRD-PARTY.md regenerated; it needs no approval.

## 11. Revisit triggers

- ~~**EP-8** seeds §3 and §4, confirms the package-manager commands in §5, pins Node, and
  decides the gitleaks successor question.~~ Done 2026-09-04 (EP-8 handoff).
- **EP-9** adds `zod` and `yaml` to §4 (ADR-2, ADR-3) with the §6 checklist in its handoff;
  any proposal to validate at runtime with Zod is a §3 addition (owner).
- **Any proposed addition to §3** (owner decision).
- **Any Dependabot or CodeQL alert** that ends in an accepted risk.
- **Every tagged release** and the EP-38 audit (gates 5 and 6).
- **Any change to D-ARCH-007** (bundle budget) or to the framework/validation ADRs.
