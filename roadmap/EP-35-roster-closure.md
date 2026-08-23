# EP-35 — Roster closure audit

**Size:** S · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** EP-26…EP-33 (all case EPs + Formulary wave 2), EP-34 (Content-at-scale) ·
**Blocks:** EP-38 (v1.0 release audit & sign-off)

## Context

The audit that closes R2 content. All eleven cases (OQ-2 assumption: roster = 11, tiers 2/6/3
per D-TAX-004) and the completed formulary are in the tree, each case individually signed off.
This EP verifies the **roster as a whole**: the coverage matrix satisfied against the canonical
matrix in [appendices/clinical-model.md](appendices/clinical-model.md) (D-TAX-002, D-PROD-005),
the roster-level aggregate stigma/demographic audit that no single-case checklist can perform
(D-GOV-004), the claim–evidence matrix updated with live content rows (D-QA-002), and — if any
schema migration since a case's review was declared clinical-semantics-changing — the D-GOV-001
re-review sweep. Ends at an owner gate; the post-EP-35 R3-entry re-plan checkpoint follows as an
ordinary session.

## Safety & policy preconditions

- Synthetic-only: audit only; any fixes routed through case changelogs remain fully synthetic.
- Clinical sign-off (D-EXEC-003): any content change this audit forces goes back through the
  D-GOV-001 lifecycle for its case — this EP never edits accepted/unsafe sets directly.
- Harm language (D-SCOR-003): spot-audit item below; violations are fixed via the owning case's
  lifecycle.
- Leak prevention: n/a — no screenshots; audit outputs are public-safe (no private planning
  references).
- Licensing/attribution (D-DATA-006): citation completeness re-verified mechanically
  (INV-CIT-001); registry spot-checked against sources cited across the roster.
- Accessibility (D-UX-004): n/a — no UI work (INV-A11Y-001 already gates content).
- Security baseline (D-SEC-001): n/a.

## In scope

1. **Coverage print vs matrix:** run `coverage --format md`; commit the rendered matrix; verify
   every must-cover phenotype row (D-TAX-002) has ≥1 primary carrier and every roster claim in
   the canonical matrix is met; tier distribution matches D-TAX-004; ≥2 record-wrong cases
   present (D-CASE-002); both allergy sub-task carriers present (D-MED-003).
2. Full-tree gate: `coverage --gate` now requires the complete matrix (upgrade from EP-34's
   staged scope); CI green with it.
3. **Roster-level AGGREGATE stigma/demographic audit** (the checklist's cross-case item): tabulate
   patient demographics, conditions, and mechanism framings across all 11 cases; check for
   stereotype clustering (e.g., which demographics carry which discrepancy mechanisms); document
   findings; route any needed changes through the owning case's lifecycle.
4. **Claims-matrix content rows** (D-QA-002): flip case-count rows to live numbers; add/refresh
   rows for the coverage matrix, review-record completeness ("physician-reviewed (single
   reviewer)" wording verified everywhere — never "expert-reviewed"), and per-case badges
   (D-RISK-003).
5. **Re-review sweep:** if any migration since a case's review record was declared
   clinical-semantics-changing (EP-34 manifest), re-run that case's D-GOV-001 review path and
   version the record; if none, record "no semantics-changing migrations" explicitly.
6. Spot-audit pass across the roster: harm-language lint clean tree-wide, review-record dates and
   checklist versions coherent, golden snapshots green.
7. **STOP at ready-for-review**; present the audit package (matrix print, aggregate audit,
   claims diffs, sweep result).

## Out of scope

- Authoring or editing any case content — owning case lifecycles.
- Accessibility/usability gates — EP-36/EP-37. Release execution — EP-38.
- Roster growth or shrink — owner-only scope change (OQ-2 slack: C02 merge path documented in
  the risk register, not exercised here).

## Owner checkpoints

**OWNER GATE — closes R2 content (D-EXEC-003).** Owner reviews the audit package and signs; the
sign-off is recorded as a dated entry in the audit record committed with this EP. Not done until
signed. Any aggregate-audit finding requiring content change re-opens the owning case's gate
instead of being patched silently.

## Verification / acceptance

- `coverage --gate` (full matrix) green in CI on both OSes; committed matrix print matches the
  canonical matrix.
- Every case directory contains a parsed, signed public review record with badge fields; wording
  check ("single reviewer") passes tree-wide *(mechanical grep + review)*.
- Claims matrix has no orphan content claims (every row evidenced or softened).
- Aggregate stigma/demographic audit committed with findings and dispositions *(judgement —
  owner)*.
- Sweep outcome recorded (re-reviews done, or none-needed statement).

## Handoff

Standard fields + the audit record path, matrix print path, claims-matrix diff summary, aggregate
audit dispositions, and confirmation that the R3-entry re-plan checkpoint is now due.

## Parked → final-roadmap.md

none expected; roster-expansion ideas go to B-8 or the parked list (D-RISK-002).
