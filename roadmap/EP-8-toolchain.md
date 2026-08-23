# EP-8 — Toolchain bootstrap + ADRs

**Size:** L · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-0 (Baseline floor), EP-1 (GitHub security settings & baseline doc) · **Blocks:** EP-9 (Content schema v0 + validator core), EP-10 (Visual identity & originality pack), EP-15 (App shell & accessibility skeleton)

## Context

First implementation session (D-EXEC-004): monorepo workspace, TypeScript/Vite toolchain, CI on
both OSes, Pages hello-world, and the delegated ADRs — framework (D-ARCH-004) and validation
library (D-DATA-003) decided by measurement, not preference. Layout, CI stages, and ADR frames:
[appendices/architecture.md](appendices/architecture.md) §1 (package layout), §7 (CI/test plan),
§8 (ADR frames). Spikes SP-4 (bundle floor) and SP-5 (schema-lib ergonomics) run inside this EP
([appendices/spikes.md](appendices/spikes.md)). Integrator resolutions applied: I-1 (code stays
under `medrecsim/`, per A-001), I-3 (hybrid Zod-source-of-truth + exported JSON Schema is an
acceptable ADR-2 outcome), I-5 (Windows parity = CI stages on PRs; e2e ubuntu-on-PR +
windows-nightly). Assumes OQ-8 (golden updates guarded by PR-template flag). Version facts were
recorded 2026-08-23 — **reverify at execution** (D-RISK-006). Constraints: Windows-native
toolchain, Node LTS, no WSL/containers (D-ARCH-003); bundle ≤ ~300 KB gz (D-ARCH-007). If the session runs long, the
pre-declared split point is after the ADRs + spikes (SP-4/SP-5) land: scaffold/CI/Pages may
complete in a continuation sitting under this same brief.

## Safety & policy preconditions

- Synthetic-only content: n/a — no clinical content; hello-world copy uses the CLAIMS.md
  standing-disclaimers banner text only.
- Clinical sign-off (D-EXEC-003): n/a.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: CI logs and ADRs must contain no local paths/usernames; screenshots n/a.
- Licensing/attribution (D-DATA-006): every new dependency gets a license check + THIRD-PARTY
  entry via the regen script below.
- Accessibility (D-UX-004): ADR-1 weighs accessibility/testing ecosystem maturity as a named
  criterion; no UI surfaces built here beyond hello-world.
- Security baseline (D-SEC-001): this EP lands the workflow-level items — SHA pins, scoped
  tokens, fork-safe CI, ignore-scripts; nothing may weaken EP-1 settings.

## In scope

1. SP-4: bundle-floor measurement — hello-world + one representative accessible component in
   Svelte 5 and React 19 under identical Vite config; record gz sizes + throttled 2018-class
   profile timings in a table.
2. SP-5: schema-lib ergonomics — yaml-language-server `$schema` autocomplete against exported
   JSON Schema; Zod 4 `z.toJSONSchema` fidelity for a claim-shaped schema.
3. Write ADRs (in-repo, e.g. `docs/adr/`): ADR-1 framework (SP-4 table + D-ARCH-004 criteria);
   ADR-2 validation lib (SP-5; hybrid acceptable per I-3); ADR-3 build-time content compile —
   runtime never parses YAML; ADR-4 package manager (npm vs pnpm; isolation as supply-chain
   criterion); ADR-5 no UI state library — engine owns state (D-ARCH-006); ADR-6
   property-test lib (fast-check) if not folded into ADR-5.
4. Workspace under `medrecsim/`: `packages/engine`, `packages/schema`, `packages/content-tools`,
   `packages/app`, plus `content/formulary/`, `content/cases/`, `tests/golden/`, `tests/e2e/`.
   TS strict, Vite, Vitest, ESLint (+ a placeholder engine-determinism lint rule), formatter.
5. Hello-world app in `packages/app` rendering the persistent synthetic/no-affiliation banner
   (D-UX-006; copy from docs/CLAIMS.md), building within budget.
6. `ci.yml`: install (frozen lockfile) → lint/format → typecheck → unit → build + bundle-budget
   check (≤300 KB gz) — matrix ubuntu + windows (I-5); no secrets; forked-PR-safe (never
   `pull_request_target` + fork checkout).
7. W4 cross-hooks: **DCO CI check** (small grep script, no third-party app);
   **dependency-review-action** on PRs; **all actions SHA-pinned**; **`.npmrc` with
   `ignore-scripts=true`**; **`pages.yml` deploying from `main` only** via official actions,
   `pages: write` + `id-token: write` scoped to the deploy job, environment restricted to main,
   gated on CI green; **THIRD-PARTY.md regeneration script** wired into the release checklist
   (populates the EP-2 stub from the lockfile).
8. Seed the runtime-dependency allowlist section of `docs/DEPENDENCY-POLICY.md` with exactly
   what was installed; present it to the owner (deps beyond it are owner-only, D-EXEC-003).
9. Register the now-existing CI checks as required in the EP-1 ruleset; update
   `docs/SECURITY-BASELINE.md` rows (dated).
10. Deploy hello-world to Pages; verify the banner on the live URL.

## Out of scope

- Schema package contents + validator CLI → EP-9. Design tokens/fonts → EP-10.
- Engine → EP-11/12. Playwright/axe stages → EP-15/EP-18 (slots noted in ci.yml comments).
- Turborepo/Nx or any build orchestrator → rejected (supply-chain surface); revisit only via
  parked entry.

## Owner checkpoints

- Owner confirms the seeded runtime-dependency allowlist (D-EXEC-003) *(judgement — owner)*.
- npm scope/name usage follows the EP-3 verdict; any conflict → owner (naming is owner-only).

## Verification / acceptance

- CI green on both OSes on `main`; Pages hello-world live with the banner visible.
- ADRs merged, each containing measured evidence (SP-4 table; SP-5 demo result or documented
  failure).
- Bundle-budget job demonstrably fails on an oversized fixture (shown once on a branch, then
  reverted).
- DCO check demonstrably fails an unsigned commit (scratch branch, then deleted).
- No action reference without a full-length commit SHA (grep check); `.npmrc` contains
  `ignore-scripts=true`; `pages.yml` triggers only on push to `main`.
- `main` runnable and CI green at completion.

## Handoff

Standard fields, plus: chosen framework + validation lib with one-line rationale; final
dependency allowlist; measured bundle baseline vs the 300 KB budget; the ci.yml stage list with
slots reserved for later EPs; reverified version facts.

## Parked → final-roadmap.md

none expected; any tooling wishlist items (orchestrators, extra linters) go to the parked list.
