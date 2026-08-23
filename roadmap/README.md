# medrecsim roadmap

Master roadmap for building medrecsim v1: a client-only, fully synthetic, accessible
medication-reconciliation training simulation. Planned 2026-08-23 under the approved
[Planning Charter](charter.md); every design decision cited as `D-*` resolves in
[../DECISIONS.md](../DECISIONS.md). Roadmap planning drew on four specialist workstreams
(clinical/cases, technical architecture, UX/accessibility, governance/security) plus an
independent adversarial review; their integrated substance lives in [appendices/](appendices/).

**Repository audit at planning time (2026-08-23):** public skeleton only — a two-line README,
empty subdirectory READMEs, two commits, no license/CI/code. Everything below builds from zero.
The repo is public during construction by decision (D-RISK-001); EP-0 lands the hygiene floor
before anything else is pushed.

## How to use this roadmap

Each `EP-N-*.md` brief is **self-contained**: a session that has read `../CLAUDE.md` →
`../DECISIONS.md` → this file's phase table → that one brief can execute it without reading any
other brief. Hand one brief to one session. Execute respecting the dependency column, verify the
acceptance criteria, commit, then record the commit hash in the Done column here. Implementation
EPs leave `main` runnable and CI green; content EPs are not done until the owner's signed public
review record exists (D-EXEC-003). Sizes are S/M/L; there are **no calendar dates by design**
(D-RISK-006). New ideas discovered mid-EP go to [final-roadmap.md](final-roadmap.md), never into
a running EP (D-RISK-002).

Case reference states, scoring semantics, outward claims, licensing/naming, and anything listed
in D-EXEC-003 are **owner-only**; briefs mark these checkpoints explicitly. The twelve
integration questions in [appendices/open-questions.md](appendices/open-questions.md) were all
ruled on at roadmap approval (2026-08-23, recommendations accepted — recorded in DECISIONS.md);
`OQ-n` citations in briefs therefore reference settled rulings.

**Numbering note vs D-EXEC-004.** The ledger's "first three implementation sessions" (there
called EP-0 baseline / EP-1 toolchain / EP-2 schema+exemplar) map to this roadmap's **EP-0**
(baseline floor, with the rest of the R0 governance pack as EP-1–7), **EP-8** (toolchain), and
**EP-9 + EP-12 + EP-14** (schema, golden harness, exemplar case). The substance is unchanged;
only the numbering grew when governance and clinical-instrument work was sliced finer.

## R0 — Foundation & governance

Repo hygiene, security baseline, policy pack, and the clinical-governance instruments that all
content work depends on. Ends with the repo presentable and every gate instrument in place.

| # | Brief | Size | Depends on | Done |
|---|-------|------|-----------|------|
| EP-0 | [Baseline floor: ignore/hooks/licenses](EP-0-baseline-floor.md) | S | — | ☑ e537b11 |
| EP-1 | [GitHub security settings & baseline doc](EP-1-security-settings.md) | S | EP-0 | ☑ 5ba112f |
| EP-2 | [Community & governance pack](EP-2-community-pack.md) | M | EP-0 | ☐ |
| EP-3 | [Name & identity screening spike](EP-3-name-screen.md) | S | — | ☐ |
| EP-4 | [Threat model, procedures & MIMIC gate](EP-4-threat-model.md) | M | EP-1 | ☐ |
| EP-5 | [Claims matrix, release criteria, changelog](EP-5-claims-criteria.md) | S | EP-2 | ☐ |
| EP-6 | [Clinical governance specs: citations & checklists](EP-6-clinical-governance.md) | S | — | ☐ |
| EP-7 | [Discrepancy taxonomy v1](EP-7-taxonomy.md) | M | EP-6 | ☐ |

## R1 — Vertical slice → v0.1

Toolchain, schema, engine, minimal accessible UI, and **one complete introductory case**
(C01 "Three Lists") playable end-to-end on GitHub Pages. Ends with tag `v0.1.0`.

| # | Brief | Size | Depends on | Done |
|---|-------|------|-----------|------|
| EP-8 | [Toolchain bootstrap + ADRs](EP-8-toolchain.md) | L | EP-0, EP-1 | ☐ |
| EP-9 | [Content schema v0 + validator core](EP-9-schema.md) | L | EP-8, EP-7 | ☐ |
| EP-10 | [Visual identity & originality pack](EP-10-identity.md) | S | EP-3, EP-8 | ☐ |
| EP-11 | [Engine core](EP-11-engine-core.md) | M | EP-9 | ☐ |
| EP-12 | [Engine scoring, signature, debrief data + golden harness](EP-12-engine-scoring.md) | M | EP-11 | ☐ |
| EP-13 | [Formulary wave 1](EP-13-formulary-1.md) | M | EP-9, EP-6, EP-7 | ☐ |
| EP-14 | [Case C01 exemplar + review](EP-14-case-c01.md) | M | EP-12, EP-13 | ☐ |
| EP-15 | [App shell & accessibility skeleton](EP-15-app-shell.md) | M | EP-8, EP-10 | ☐ |
| EP-16 | [Chart surfaces v1: chips & citing](EP-16-chart-surfaces.md) | M | EP-15, EP-9 | ☐ |
| EP-17 | [Interview v1](EP-17-interview.md) | M | EP-15, EP-11 | ☐ |
| EP-18 | [Workspace, signature & score views](EP-18-workspace.md) | L | EP-16, EP-17, EP-12 | ☐ |
| EP-19 | [Picker, pre-brief, about + v0.1 release](EP-19-v01-release.md) | M | EP-18, EP-14 | ☐ |

## R2 — Depth & breadth

The full seven-source evidence set, escalation channels, evidence-timeline debrief, and the
complete reviewed case roster (11 cases per the OQ-2 ruling) with the coverage matrix satisfied.

| # | Brief | Size | Depends on | Done |
|---|-------|------|-----------|------|
| EP-20 | [Coverage tool + full invariant suite](EP-20-coverage-invariants.md) | S | EP-9 | ☐ |
| EP-21 | [Phone channel & escalations](EP-21-phone-escalations.md) | M | EP-18 | ☐ |
| EP-22 | [Artifact viewer & source voices](EP-22-artifacts.md) | M | EP-16 | ☐ |
| EP-23 | [Interview modes](EP-23-interview-modes.md) | M | EP-17, EP-21 | ☐ |
| EP-24 | [Evidence-timeline debrief](EP-24-debrief.md) | L | EP-18, EP-12 | ☐ |
| EP-25 | [Hints UI](EP-25-hints.md) | S | EP-18 | ☐ |
| EP-26 | [Cases C02 + C06](EP-26-cases-c02-c06.md) | M | EP-14, EP-21 | ☐ |
| EP-27 | [Cases C03 + C05](EP-27-cases-c03-c05.md) | M | EP-14, EP-21 | ☐ |
| EP-28 | [Cases C04 + C07](EP-28-cases-c04-c07.md) | M | EP-14, EP-21 | ☐ |
| EP-29 | [Case C08 — methadone/OUD](EP-29-case-c08.md) | L | EP-14, EP-21, EP-23 | ☐ |
| EP-30 | [Case C09 — ART restart gap](EP-30-case-c09.md) | L | EP-14, EP-21 | ☐ |
| EP-31 | [Case C10 — insulin/surrogate](EP-31-case-c10.md) | M | EP-14, EP-22, EP-23 | ☐ |
| EP-32 | [Case C11 — clozapine](EP-32-case-c11.md) | L | EP-14, EP-23 | ☐ |
| EP-33 | [Formulary wave 2](EP-33-formulary-2.md) | S | EP-13 | ☐ |
| EP-34 | [Content-at-scale: gating & migrations](EP-34-content-scale.md) | S | EP-20, ≥3 case EPs | ☐ |
| EP-35 | [Roster closure audit](EP-35-roster-closure.md) | S | EP-26–34 | ☐ |

## R3 — Hardening → v1.0

| # | Brief | Size | Depends on | Done |
|---|-------|------|-----------|------|
| EP-36 | [Accessibility gate hardening](EP-36-a11y-gate.md) | M | all UI EPs | ☐ |
| EP-37 | [Usability evaluation & remediation](EP-37-usability.md) | S | EP-36 | ☐ |
| EP-38 | [v1.0 release audit & sign-off](EP-38-v1-release.md) | M | everything | ☐ |

## Critical path & parallelism

Critical path: EP-0 → EP-1 → EP-8 → EP-9 (fed by EP-6 → EP-7) → EP-11 → EP-12 → EP-18 → EP-19
(which also requires EP-13 → EP-14, the reviewed exemplar case), then
EP-21/23/24 and the case wave → EP-35 → EP-36 → EP-38. Genuinely parallel lanes after EP-14:
UI EPs (21–25), case EPs (26–32, mutually independent), and formulary/tooling (33–34). The
schedule-shaping constraint is **owner review bandwidth**, not engineering: seven case EPs each
end at an owner sign-off gate, and the three sensitive L-cases (EP-29/30/32) should not be
scheduled back-to-back (risk R-1 in the [risk register](appendices/risk-register.md)).

Re-plan checkpoints: after EP-19 (v0.1 retrospective — resequence R2 if schema churn demands)
and after EP-35 (R3 entry — confirm gate readiness). Both are ordinary sessions using this file,
not separate EPs.

## v1.0 release criteria

The twelve-gate checklist in [appendices/governance-security.md](appendices/governance-security.md)
§7, instantiated as `docs/RELEASE-CRITERIA.md` at EP-5 and executed at EP-38. Summary: coverage
matrix satisfied · every case publicly reviewed with badges · WCAG 2.2 AA audit (automated +
manual keyboard + NVDA, zero open A/AA exceptions) · claim–evidence matrix clean · security
baseline re-verified · licenses/registry complete · screenshots leak-screened · usability pass
done · README accurate · full test pyramid green on both OSes with budgets met · governance
docs current · owner sign-off recorded in DECISIONS.md.

## Appendices (integrated specialist outputs — canonical specs the EPs implement)

- [appendices/clinical-model.md](appendices/clinical-model.md) — taxonomy value-sets, 11-case
  roster + coverage matrix, scoring/debrief spec, review checklists, citation tiers
- [appendices/architecture.md](appendices/architecture.md) — package layout, engine design,
  schema outlines, invariants, CI/test plan, ADR frames, versioning/migrations
- [appendices/ux-accessibility.md](appendices/ux-accessibility.md) — IA & screens, claim-chip
  interaction model, source voices, WCAG plan, originality checklist, usability protocol
- [appendices/governance-security.md](appendices/governance-security.md) — policy pack, security
  checklist, threat model, claims seed, name-screen results, MIMIC gate, release criteria
- [appendices/risk-register.md](appendices/risk-register.md) — consolidated risks with owner/
  trigger/mitigation/contingency
- [appendices/traceability.md](appendices/traceability.md) — requirement → decision → EP →
  acceptance mapping
- [appendices/spikes.md](appendices/spikes.md) — bounded evidence spikes with exit criteria
- [appendices/open-questions.md](appendices/open-questions.md) — the OQ ledger (OQ-1…12, all
  ruled on at roadmap approval 2026-08-23) plus the integrator-resolution table (I-1…17)

[final-roadmap.md](final-roadmap.md) holds the conditional v1.x/v2 branches (entry criteria, not
promises) and the parked-idea list.
