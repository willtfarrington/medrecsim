# EP-9 — Content schema v0 + validator core

**Size:** L · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-8 (Toolchain bootstrap + ADRs), EP-7 (Discrepancy taxonomy v1) · **Blocks:** EP-11 (Engine core), EP-13 (Formulary wave 1), EP-16 (Chart surfaces v1), EP-20 (Coverage tool + full invariant suite)

## Context

Encodes the content model as types + validators: the two-layer truth/action contract
(D-MED-005), dual-timestamp claims with the D-MED-001 status vocabulary (D-MED-002), allergy
claims on the same machinery (D-MED-003), case-bundle layout (D-GOV-003), formulary references
by ID only (D-DATA-004), and the three version streams (D-DATA-002). Taxonomy enums import
**verbatim** from the owner-approved EP-7 doc. Schema outlines and the full 17-invariant
catalogue: [appendices/architecture.md](appendices/architecture.md) §3 (schema outlines) and §4
(invariants) — this EP ships the core subset; the remainder lands at EP-20. W4 cross-hook: the
registry/citation CI invariants land here. Integrator resolutions applied: I-6 (hint text lives
in the reference layer), I-9 (fictional-universe registry = shared content package beside the
formulary). Assumes OQ-3 (escalation channel enum uses the "outpatient prescriber/program
office" relabel — a one-enum rename if the owner rules otherwise). If the session runs long, the
pre-declared split point is after item 3 (schema package, tensions T-1..T-6 logged, and the
layer-separation compile-error fixture) lands: the validate CLI, negative fixtures, exemplar
scaffold, compile step, and CI wiring may complete in a continuation sitting under this same
brief.

## Safety & policy preconditions

- Synthetic-only content: exemplar scaffold uses clearly-marked placeholder text; INV-SCOPE
  checks (real-brand-name denylist, no free-text learner fields) are introduced here.
- Clinical sign-off (D-EXEC-003): schema *shape* is technical; any placeholder that reads like
  clinical teaching content is marked `PLACEHOLDER — not reviewed`. No accepted/unsafe content
  is authored here.
- Harm language (D-SCOR-003): the harm-language lint (probability-token denylist;
  numbers-require-citation-ref; explicit `inevitabilityAuthored` flag) ships in INV-ACT-001.
- Leak prevention: fixtures are synthetic per the EP-0 allowlist convention (`# SYNTHETIC`
  headers).
- Licensing/attribution (D-DATA-006): SPDX headers required in content YAML (CI-checkable);
  registry-row invariant for external assets.
- Accessibility (D-UX-004): schema requires `renderText` on artifacts and `pillAppearanceText`
  on formulary entries (nonvisual cues) — INV-A11Y-001 fields exist even though the strict
  check lands later.
- Security baseline (D-SEC-001): validator runs in CI without secrets; no new actions beyond
  SHA-pinned ones.

## In scope

1. `@medrecsim/schema`: types + validators for `case.yaml` (id/slug/title/schemaVersion/
   contentVersion/tier/recommendedSequenceIndex/coverage declarations/reviewRecordRef +
   preBriefBadge (D-RISK-003)/preBrief/estimatedMinutes/formularyVersionRange); `evidence.yaml`
   (patient + T0; the 7 source types with availability + accessCostMinutes; claims with
   formularyId-or-sanctioned-unresolved-label, D-MED-001 claimStatus, dose/route/freq/
   formulation, eventTime + documentationTime, asStatedText; allergyClaims as a discriminated
   union; dialogue trees with costMinutes/revealsClaimIds/unlocks/reliabilityModifier;
   artifacts with kind/renderText/labelClaims/examineCostMinutes; escalationChannels with
   availabilityWindow/latencyMinutes/responseContent/unansweredBehavior); `reference.yaml`
   (referenceRegimen; actualUseState with knowability marks; discrepancies with five-axis
   enums + detectabilityPaths + ordinals + resolutionExpectation + per-item freezability flag
   (D-RISK-004); actionSets accepted/partiallyAccepted/unsafe with rationale per entry and
   mechanismOfHarm per unsafe; expectedEscalations; hints nudge/directed/revealSource;
   teaching-note refs + citations per the EP-6 format). Formulary entry + fictional-universe
   registry (I-9) schemas. `SCHEMA_VERSION` constant; version stamps per D-DATA-002.
2. Decide and log the six schema tensions (reversible, D-EXEC-003; per architecture.md §3):
   T-1 relative-vs-absolute time (recommendation: author relative, compile absolute); T-2
   unresolved-label escape hatch vs D-DATA-004 (ratify a sanctioned flag); T-3 claim-reveal
   granularity (partial fields); T-4 detectability AND/OR path encoding; T-5 shared vs per-case
   rationale menus; T-6 hint-text location (I-6 baseline: reference layer).
3. Two-layer contract at the type level: learner-observable evidence types cannot reference
   reference-layer types (D-MED-005); include a compile-error fixture proving it.
4. `validate` CLI in `packages/content-tools` (`validate [--all] [--format
   pretty|json|github]`, exit 1 on failure) with the core invariant subset: INV-TIME-001 (both
   timestamps, doc ≥ event), INV-REF-001 (formularyId resolves or sanctioned escape flag),
   INV-TRUTH-001 (layer separation), INV-DISC-001 (five axes + ≥1 detectability path +
   ordinals), INV-ACT-001 (nonempty accepted sets, rationale per entry, mechanism per unsafe,
   harm-language lint), INV-META-001 (tier/coverage declarations match metadata; review record
   parses), INV-VERS-001 (schema stamps match) — plus the W4 cross-hooks: citation-presence
   check (warn-level until INV-CIT-001 strict at EP-20), SPDX-header check, registry-row check.
5. Negative fixtures: ≥1 failing fixture per shipped invariant, rejected in CI by name.
6. Schema-derived authoring doc + exemplar case scaffold in `content/cases/_exemplar/`
   (structure complete, placeholder clinical text clearly marked — the real exemplar is EP-14).
7. `compile` step: YAML → JSON chunks (ADR-3); the app never parses YAML at runtime.
8. Wire `validate --all` + negative-fixture suite into `ci.yml`.

## Out of scope

- Remaining invariants (TIME-002/003, REF-002, DISC-002/003, ACT-002 winnability, CIT-001
  strict, HINT-001, SCOPE-001 full, A11Y-001 strict) + coverage CLI → EP-20.
- Engine consumption → EP-11. Real formulary entries → EP-13. Real case content → EP-14.
- Migration runner/codemod exercise → EP-34.

## Owner checkpoints

none beyond inherited ones — tensions T-1..T-6 are reversible technical calls (logged); the
enums were owner-approved at EP-7. If any tension decision would change clinical semantics,
pause and ask.

## Verification / acceptance

- `validate --all` green on the exemplar scaffold; each negative fixture fails naming its
  invariant ID (CI job output).
- Compile-error fixture proves evidence types cannot import reference types.
- Harm-language lint rejects a fixture containing a probability token and an uncited number.
- CI includes the content-validate stage on both OSes; `main` runnable, CI green.

## Handoff

Standard fields, plus: T-1..T-6 decisions with one-line rationale each; the exact enum list
imported from EP-7 (spelling-frozen); which invariants remain for EP-20; the OQ-3 assumption
restated.

## Parked → final-roadmap.md

Schema affordances not needed for v1 (e.g., claims-feed source types for B-1) are noted as
comments, never implemented (D-RISK-002).
