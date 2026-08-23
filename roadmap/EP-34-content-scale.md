# EP-34 — Content-at-scale: gating & migrations

**Size:** S · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-20 (Coverage tool + full invariant suite), ≥3 case EPs complete (any of
EP-26…EP-32) · **Blocks:** EP-35 (Roster closure audit)

## Context

With several reviewed cases in the tree, the content pipeline hardens for scale: coverage
checking flips from informative to **gating** in CI, and the schema-migration machinery
(D-DATA-002: scripted in-repo codemods migrating all bundles in the same change; app supports
exactly one schema major) is exercised deliberately *before* a real migration is ever needed
(risk R-2 mitigation). Migration files must declare whether they are clinical-semantics-preserving
or clinical-semantics-changing — the latter fires the D-GOV-001 re-review trigger that EP-35
sweeps. Canonical spec: [appendices/architecture.md](appendices/architecture.md) (CLI contract,
versioning/migrations). Assumes integrator resolution I-4: local convenience state is discarded
on **any** contentVersion bump.

## Safety & policy preconditions

- Synthetic-only: n/a — tooling only; any new fixtures follow the synthetic-fixture convention.
- Clinical sign-off (D-EXEC-003): the exercised codemod is a **no-op** — it must not alter
  clinical semantics; the semantics-changing pathway is built but only *declared*, never executed
  here.
- Harm language (D-SCOR-003): n/a — no content authored.
- Leak prevention: n/a.
- Licensing/attribution (D-DATA-006): n/a.
- Accessibility (D-UX-004): n/a — no UI surfaces.
- Security baseline (D-SEC-001): migration runner is a dev-only tool; no new runtime
  dependencies without the allowlist process.

## In scope

1. Flip `coverage --gate` ON in the CI content stage: unmet must-cover rows now fail CI. Gate
   scope at flip time = rows carried by cases present in the tree; the full-matrix requirement
   lands with EP-35 (document the staged threshold in the workflow file).
2. Migration runner completion in content-tools: `migrate <codemod-id> [--dry-run]` applies a
   codemod across **all** bundles + formulary in one change; refuses partial application.
3. Codemod manifest format: each migration declares target schema version and a
   `clinicalSemantics: preserving|changing` field; `changing` emits the D-GOV-001 re-review
   obligation into each affected case changelog automatically.
4. Exercise a **no-op codemod** end-to-end across every bundle in the tree: version stamps bump,
   validators stay green, golden snapshots unchanged (proving semantic neutrality mechanically).
5. CI consistency checks: schema version bumped ⇒ all bundle stamps current (INV-VERS-001
   enforced repo-wide); contentVersion bump ⇒ localStorage discard behavior covered by an engine
   test (I-4).
6. Authoring-docs update: migration workflow section added to the schema-derived authoring doc.

## Out of scope

- Any real (non-no-op) migration — only when a schema change demands it, as its own change with
  its own review implications.
- The re-review sweep itself — EP-35. Coverage-matrix completion — case EPs.
- GUI authoring tooling — final-roadmap.md B-10.

## Owner checkpoints

none — tooling only. If the no-op codemod exercise reveals that a *real* breaking change is
already needed, stop and surface it (R-2 contingency: batch into one major bump) rather than
migrating silently.

## Verification / acceptance

- CI run demonstrably fails on a fixture tree with an unmet gated coverage row, passes on the
  real tree.
- No-op codemod run: all bundles touched, `validate --all` green, golden snapshots byte-identical,
  version stamps advanced.
- Engine test proves stored convenience state is politely discarded after a contentVersion bump.
- CI green on both OSes; `main` runnable.

## Handoff

Standard fields + the gated-row scope at flip time, the no-op codemod ID and its run evidence,
and any schema-debt discovered (with the R-2 escalation if triggered).

## Parked → final-roadmap.md

none expected (D-RISK-002 applies).
