# medrecsim roadmap

Master roadmap for building medrecsim v1: a client-only, fully synthetic, accessible
medication-reconciliation training simulation. Planned 2026-08-23 under the approved
[Planning Charter](charter.md); every design decision cited as `D-*` resolves in
[../DECISIONS.md](../DECISIONS.md). Roadmap planning drew on four specialist workstreams
(clinical/cases, technical architecture, UX/accessibility, governance/security) plus an
independent adversarial review; their integrated substance lives in [appendices/](appendices/).
From 2026-11-10 the phase tables follow the house style (D-ROAD-003): the header
`| # | Brief | Size | Depends on | Core | Done |`, a done cell `☑` and its backticked commit
hash, an open cell `☐`; the next brief is the first unchecked row in table order.

*(2026-11-25, the sweep, IN-1; the owner's choices, D-ROAD-004.)* The project is **active**,
EP-12 next. The rule block at the end of [../CLAUDE.md](../CLAUDE.md) is the current one
(`crw formalise`, the text around it kept). A brief is S (about 30 minutes of active work) or M
(about 45): an open L row is split at its pickup, as is any row that proves larger there. A
manual is owed: [docs/manual.md](../docs/manual.md) is a stub until **EP-19a** writes the first
manual after v0.1, and meanwhile each brief that changes what a user sees or does adds its
section to [docs/manual-changes.md](../docs/manual-changes.md).

*(2026-11-25, after the sweep's push, the owner's choice; D-ROAD-005.)* **EP-11a**, a
dependency refresh (Dependabot PRs #9 and #7 and the open alerts), now comes before EP-12, so
that the engine work starts on current tools.

*(2026-11-26, EP-11a, the owner's choice; D-ROAD-006.)* **EP-11b**, the move to the Node 26
LTS line with pnpm provisioned without Corepack, follows EP-11a and comes before EP-12: the
owner's machine moved to Node 26 on 2026-11-10, and the Node 24 pin no longer runs there.

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
review record exists (D-EXEC-003). Sizes are S (about 30 minutes of active work) or M (about
45); an L row, planned before 2026-11-25, is split at its pickup (D-ROAD-004). There are **no
calendar dates by design** (D-RISK-006). New ideas discovered mid-EP go to
[final-roadmap.md](final-roadmap.md), never into a running EP (D-RISK-002).

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

| # | Brief | Size | Depends on | Core | Done |
|---|-------|------|-----------|------|------|
| EP-0 | [Baseline floor: ignore/hooks/licenses](EP-0-baseline-floor.md) | S | — | core | ☑ `e537b11` |
| EP-1 | [GitHub security settings & baseline doc](EP-1-security-settings.md) | S | EP-0 | core | ☑ `5ba112f` |
| EP-2 | [Community & governance pack](EP-2-community-pack.md) | M | EP-0 | core | ☑ `80710ef` |
| EP-3 | [Name & identity screening spike](EP-3-name-screen.md) | S | — | core | ☑ `9ece0a1` |
| EP-4 | [Threat model, procedures & MIMIC gate](EP-4-threat-model.md) | M | EP-1 | core | ☑ `0773abd` |
| EP-5 | [Claims matrix, release criteria, changelog](EP-5-claims-criteria.md) | S | EP-2 | core | ☑ `f3a1e28` |
| EP-6 | [Clinical governance specs: citations & checklists](EP-6-clinical-governance.md) | S | — | core | ☑ `cb6a3dc` |
| EP-7 | [Discrepancy taxonomy v1](EP-7-taxonomy.md) | M | EP-6 | core | ☑ `7fa5940` |

## R1 — Vertical slice → v0.1

Toolchain, schema, engine, minimal accessible UI, and **one complete introductory case**
(C01 "Three Lists") playable end-to-end on GitHub Pages. Ends with tag `v0.1.0` and the first
manual (EP-19a, D-ROAD-004).

| # | Brief | Size | Depends on | Core | Done |
|---|-------|------|-----------|------|------|
| EP-8 | [Toolchain bootstrap + ADRs](EP-8-toolchain.md) | L | EP-0, EP-1 | core | ☑ `bee0acb` |
| EP-9 | [Content schema v0 + validator core](EP-9-schema.md) | L | EP-8, EP-7 | core | ☑ `19a8471` |
| EP-10 | [Visual identity & originality pack](EP-10-identity.md) | S | EP-3, EP-8 | core | ☑ `cc5c892` |
| EP-11 | [Engine core](EP-11-engine-core.md) | M | EP-9 | core | ☑ `40e37d8` |
| EP-11a | [Dependency refresh: Dependabot PRs #9 and #7 and the open alerts (D-ROAD-005)](EP-11a-dependency-refresh.md) | M | EP-8 | core | ☐ |
| EP-11b | Node 26 LTS: the pin, engines and pnpm without Corepack (D-ROAD-006) | M | EP-11a | core | ☐ |
| EP-12 | [Engine scoring, signature, debrief data + golden harness](EP-12-engine-scoring.md) | M | EP-11 | core | ☐ |
| EP-13 | [Formulary wave 1](EP-13-formulary-1.md) | M | EP-9, EP-6, EP-7 | core | ☐ |
| EP-14 | [Case C01 exemplar + review](EP-14-case-c01.md) | M | EP-12, EP-13 | core | ☐ |
| EP-15 | [App shell & accessibility skeleton](EP-15-app-shell.md) | M | EP-8, EP-10 | core | ☐ |
| EP-16 | [Chart surfaces v1: chips & citing](EP-16-chart-surfaces.md) | M | EP-15, EP-9 | core | ☐ |
| EP-17 | [Interview v1](EP-17-interview.md) | M | EP-15, EP-11 | core | ☐ |
| EP-18 | [Workspace, signature & score views](EP-18-workspace.md) | L | EP-16, EP-17, EP-12 | core | ☐ |
| EP-19 | [Picker, pre-brief, about + v0.1 release](EP-19-v01-release.md) | M | EP-18, EP-14 | core | ☐ |
| EP-19a | First manual: v0.1's surfaces and the walkthrough (D-ROAD-004) | M | EP-19 | core | ☐ |

**Brief notes.**

- **EP-11b.** (Added 2026-11-26 at EP-11a, the owner's choice; D-ROAD-006.) Move the project
  to the Node 26 LTS line before EP-12. On 2026-11-10 the owner's machine moved to Node 26.13.1
  (winget's LTS channel), which ships no Corepack, so the Node 24.14.1 pin (`.nvmrc`, `engines`
  `>=24.14.1 <25` with `engine-strict`) and the Corepack-provisioned pnpm no longer run
  locally; CI, which installs 24.14.1, is unaffected until then. Scope: `.nvmrc` and `engines`
  to the current Node 26 LTS; pnpm 11.25.0 provisioned without Corepack, locally and in CI, as
  [docs/DEPENDENCY-POLICY.md](../docs/DEPENDENCY-POLICY.md) §8 foresees (a lockfile-pinned
  `corepack` package or a hash-verified pnpm download: choose one and record why);
  `@types/node` to 26 with `dependabot.yml`'s ignore rule moved to the new line; the policy's
  §5 and §8 and SECURITY-BASELINE rows C2 and C3 updated; `pnpm verify` green locally under
  Node 26 and hosted CI green on both operating systems. A pnpm major (12.x is out) stays out
  unless the provisioning choice needs it. Read first [docs/handoffs/EP-11a.md](../docs/handoffs/EP-11a.md):
  confirm that EP-11a's push left 0 open Dependabot alerts and a green Pages run, and reuse its
  portable-Node pattern until the move lands.
- **EP-19a.** (Added 2026-11-25 at the sweep, the owner's choice; D-ROAD-004.) Replace the stub
  [docs/manual.md](../docs/manual.md) with the first manual, describing v0.1 in the outline the
  stub holds: what it does; install and start; a chapter per surface v0.1 ships (by this table:
  the app shell, chart surfaces, interview, workspace with signature and score views, picker,
  pre-brief and about); when something goes wrong; and a walkthrough of the routes no real use
  has met, for the owner's first real use. Fold in the sections earlier briefs added to
  [docs/manual-changes.md](../docs/manual-changes.md), then empty that file to its header with a
  new `Since` line. `crw manual` builds the PDF to read it through; the PDF is never tracked.
  The manual is outward copy ([docs/CLAIMS.md](../docs/CLAIMS.md)): no claim without a row.
  Pictures beside it in `docs/` show synthetic data only, carry no metadata (D-UX-006) and are
  screened for paths, usernames and emails; the manual quotes no clinical teaching content
  beyond the reviewed case text the app shows (D-EXEC-003).

## R2 — Depth & breadth

The full seven-source evidence set, escalation channels, evidence-timeline debrief, and the
complete reviewed case roster (11 cases per the OQ-2 ruling) with the coverage matrix satisfied.

| # | Brief | Size | Depends on | Core | Done |
|---|-------|------|-----------|------|------|
| EP-20 | [Coverage tool + full invariant suite](EP-20-coverage-invariants.md) | S | EP-9 | core | ☐ |
| EP-21 | [Phone channel & escalations](EP-21-phone-escalations.md) | M | EP-18 | core | ☐ |
| EP-22 | [Artifact viewer & source voices](EP-22-artifacts.md) | M | EP-16 | core | ☐ |
| EP-23 | [Interview modes](EP-23-interview-modes.md) | M | EP-17, EP-21 | core | ☐ |
| EP-24 | [Evidence-timeline debrief](EP-24-debrief.md) | L | EP-18, EP-12 | core | ☐ |
| EP-25 | [Hints UI](EP-25-hints.md) | S | EP-18 | core | ☐ |
| EP-26 | [Cases C02 + C06](EP-26-cases-c02-c06.md) | M | EP-14, EP-21 | core | ☐ |
| EP-27 | [Cases C03 + C05](EP-27-cases-c03-c05.md) | M | EP-14, EP-21 | core | ☐ |
| EP-28 | [Cases C04 + C07](EP-28-cases-c04-c07.md) | M | EP-14, EP-21 | core | ☐ |
| EP-29 | [Case C08 — methadone/OUD](EP-29-case-c08.md) | L | EP-14, EP-21, EP-23 | core | ☐ |
| EP-30 | [Case C09 — ART restart gap](EP-30-case-c09.md) | L | EP-14, EP-21 | core | ☐ |
| EP-31 | [Case C10 — insulin/surrogate](EP-31-case-c10.md) | M | EP-14, EP-22, EP-23 | core | ☐ |
| EP-32 | [Case C11 — clozapine](EP-32-case-c11.md) | L | EP-14, EP-23 | core | ☐ |
| EP-33 | [Formulary wave 2](EP-33-formulary-2.md) | S | EP-13 | core | ☐ |
| EP-34 | [Content-at-scale: gating & migrations](EP-34-content-scale.md) | S | EP-20, ≥3 case EPs | core | ☐ |
| EP-35 | [Roster closure audit](EP-35-roster-closure.md) | S | EP-26–34 | core | ☐ |

## R3 — Hardening → v1.0

| # | Brief | Size | Depends on | Core | Done |
|---|-------|------|-----------|------|------|
| EP-36 | [Accessibility gate hardening](EP-36-a11y-gate.md) | M | all UI EPs | core | ☐ |
| EP-37 | [Usability evaluation & remediation](EP-37-usability.md) | S | EP-36 | core | ☐ |
| EP-38 | [v1.0 release audit & sign-off](EP-38-v1-release.md) | M | everything | core | ☐ |

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
