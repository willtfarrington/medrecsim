# ADR-3 — Content is compiled at build time; the runtime never parses YAML

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Implements:** D-GOV-003 (YAML/JSON case
bundles), D-ARCH-007 (bundle budget, case content lazy-loaded), D-DATA-005 (`compile` command) ·
**Reversibility:** easy until EP-9 lands the `compile` step; moderate afterwards.

## Context

Case bundles and the formulary are hand-authored YAML (D-GOV-003, D-DATA-005) because YAML is
what a physician-author edits comfortably and what `yaml-language-server` autocompletes
(ADR-2). Shipping a YAML parser in the runtime bundle would spend budget (the `yaml` package is
roughly 30 KB gzipped) and, more importantly, would move parsing errors from CI to the learner's
browser.

## Decision

- **Authored source of truth stays YAML** in `medrecsim/content/**` (so D-GOV-003's "YAML
  bundles" holds literally).
- **A build-time `compile` step** (`packages/content-tools`, EP-9) parses, validates (schema +
  invariants), and emits **JSON chunks** per case and for the formulary into the app's build
  input. The app imports those JSON chunks lazily per case (`import()`), which is how D-ARCH-007's
  "case content lazy-loaded" is met and how the initial-bundle budget excludes content.
- **The runtime never parses YAML.** The `yaml` package (2.9.0) is a dev dependency of
  `packages/content-tools` only and may never appear in the runtime allowlist
  (DEPENDENCY-POLICY.md §3). The CI no-network / bundle checks make the runtime bundle's contents
  visible; the ESLint configuration forbids importing `yaml` from `packages/app` and
  `packages/engine`.
- Compiled JSON is a **build artifact**, not committed content: regenerated on every build and
  in CI, so it can never drift from the YAML. (If EP-9 finds a reason to commit it — for
  example for golden-snapshot stability — that is a reversible EP-9 decision to log.)

## Consequences

- EP-9 owns the `compile` command, its output layout, and the CI stage-5 slot reserved in
  `ci.yml` ("content validate + coverage" precedes the build so that a malformed bundle fails
  before compilation).
- Schema version stamps (D-DATA-002) are checked at compile time (INV-VERS-001), so the runtime
  can trust the chunks it loads and only needs to check its own supported schema major.
- Reference layers are compiled and shipped too (the app is static; D-GOV-003 disclaims answer
  obfuscation). Layer separation is an API-seam guarantee in the engine (D-MED-005), not a
  packaging one.
