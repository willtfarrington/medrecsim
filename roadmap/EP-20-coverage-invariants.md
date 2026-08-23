# EP-20 — Coverage tool + full invariant suite

**Size:** S · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-9 (Content schema v0 + validator core) · **Blocks:** EP-34 (Content-at-scale: gating & migrations)

## Context

EP-9 shipped the schema package, the `validate` CLI, and the first invariant subset (INV-TIME-001,
INV-REF-001, INV-TRUTH-001, INV-DISC-001, INV-ACT-001, INV-META-001, INV-VERS-001). Before the R2
case wave lands, the automated half of the content lifecycle (D-GOV-001) must be complete: the
`coverage` command that prints the taxonomy coverage matrix (D-DATA-005, D-TAX-001/002), the
remaining invariant validators, the harm-language lint (D-SCOR-003), and strict citation checking
(D-GOV-002, warn-mode since EP-9). Canonical specs: [appendices/architecture.md](appendices/architecture.md)
(invariant definitions, CLI contract) and [appendices/clinical-model.md](appendices/clinical-model.md)
(matrix rows, ordinal scales). Only case C01 exists as content when this runs; negative fixtures
carry the test load.

## Safety & policy preconditions

- Synthetic-only: all fixtures are invented; negative fixtures follow the synthetic-fixture
  allowlist convention with `# SYNTHETIC` headers (D-SEC-001).
- Clinical sign-off (D-EXEC-003): n/a — no clinical content authored; validators mechanize
  already-recorded decisions and may not loosen or extend them.
- Harm language (D-SCOR-003): the lint built here enforces it; lint rules restate the decision.
- Leak prevention: n/a — no screenshots or new docs beyond code and fixtures.
- Licensing/attribution (D-DATA-006): n/a — no new assets or sources.
- Accessibility (D-UX-004): INV-A11Y-001 (renderText + pillAppearanceText present) is implemented
  here; no UI surface changes.
- Security baseline (D-SEC-001): no new dependencies outside the EP-8 allowlist process.

## In scope

1. `coverage [--format table|json|md] [--gate]` in the content-tools CLI: prints the coverage
   matrix versus the must-cover phenotype rows (D-TAX-002); informative by default. `--gate`
   exits nonzero on unmet rows but is not wired into CI until EP-34.
2. Implement the remaining invariants: INV-TIME-002 (post-T0 actions never mutate pre-T0 state),
   INV-TIME-003 (timeline satisfiability — authored latencies answerable before signature),
   INV-REF-002 (LASA partners bidirectional; LASA-phenotype cases contain partner claims),
   INV-DISC-002 (every detectability path reachable — graph check), INV-DISC-003 (knowable ⇒
   detectable; irreducible ⇒ no complete path AND accepted set includes unable-to-verify),
   INV-HINT-001 (all three hint grades present), INV-SCOPE-001 (no free-text learner fields,
   real-brand-name denylist, banner declaration present), INV-A11Y-001.
3. INV-ACT-002 winnability solver: prove ≥1 action sequence within accepted sets passes
   signature. Constrain search to authored accepted-set paths; if runtime explodes (risk R-12 in
   [appendices/risk-register.md](appendices/risk-register.md)), downgrade to per-artifact
   completability checks + the golden full-credit script as the proof, and log the decision.
4. Harm-language lint inside the INV-ACT-001 family: probability-token denylist, numeric claims
   require a citation reference, inevitable-harm phrasing requires the authored flag (D-SCOR-003).
5. Flip INV-CIT-001 to strict: every reference-layer clinical rule carries ≥1 Tier-A/B citation
   with version + access date per the EP-6 citation format (D-GOV-002); error, not warn.
6. One negative fixture per new invariant (each fails exactly its own check) plus passing
   fixtures; C01 passes the full suite unchanged.
7. Wire all invariants into `validate` and the CI content stage; `coverage` runs informative in CI.

## Out of scope

- Coverage gating ON in CI and the migration runner — EP-34.
- Any new case content — EP-26…EP-32. Formulary growth — EP-33.
- Golden-snapshot semantics changes — owner-only path via EP-12's harness (OQ-8 assumption).

## Owner checkpoints

none — purely technical; any semantic ambiguity found in a decision is logged and raised, never
resolved by loosening a check.

## Verification / acceptance

- `validate --all` and `coverage` run green on C01 and passing fixtures; each negative fixture
  fails citing its intended invariant ID.
- `coverage --gate` exits nonzero while must-cover rows remain unmet (expected pre-case-wave)
  and zero on a synthetic all-rows-met fixture set.
- CI green on both OSes; `main` runnable.
- If the solver fallback is taken, it is logged as a reversible decision *(judgement — executing
  session, logged per D-EXEC-003)*.

## Handoff

Standard fields + the list of invariant IDs now enforced, the coverage matrix print for the
current tree, and any solver-fallback decision logged.

## Parked → final-roadmap.md

none expected; new validator ideas beyond the specified set are parked, not built (D-RISK-002).
