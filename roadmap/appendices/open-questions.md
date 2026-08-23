# Open questions — OQ ledger (ALL RESOLVED 2026-08-23)

**Status: closed.** At roadmap approval the owner accepted the planning recommendation on all
twelve questions; the rulings are recorded in [../../DECISIONS.md](../../DECISIONS.md)
("Roadmap-integration rulings"). The table is retained as the record of what was asked and
assumed — every "assumed" answer below is now a decided fact, so briefs citing an OQ-n stand
on settled ground. Future questions get new OQ numbers appended here and go to the owner per
D-EXEC-003.

| ID | Question | Planning recommendation / current assumption | Affects |
|---|---|---|---|
| OQ-1 | Clozapine or lithium for the psychiatric high-alert case (C11)? Clozapine teaches the deterministic ≥48h-lapse retitration rule; lithium teaches levels/toxicity/interactions. | **Clozapine** (assumed in roster) | EP-32 |
| OQ-2 | Approve roster size **11** (2 intro / 6 core / 3 advanced) as the coverage-derived D-PROD-005 count? Matrix shows every must-cover phenotype with ≥1 primary carrier; C02 is mergeable to reach 10 at the cost of the intro ramp. | **11** (assumed) | EP-26–32, EP-35 |
| OQ-3 | Relabel the "PCP/specialist office" escalation channel to **"outpatient prescriber/program office"** so OTP (C08) and HIV clinic (C09) calls ride it cleanly without a fifth action? | **Relabel** (assumed; still exactly four scored actions per D-CLIN-002) | EP-9, EP-21, EP-29, EP-30, EP-32 |
| OQ-4 | Adjudicate parked P-001 (authored "paged away" end-trigger) and P-002 (dismissible pharmacy-flag interruption), due at case design per the ledger. | **Defer both to v1.x** (assumed; P-002's alert-fatigue lesson taught in debrief text at v1) | final-roadmap.md |
| OQ-5 | Does the ~150-entry formulary floor (D-DATA-001) bind — pad with realistic distractor entries — or flex to the roster-driven count (~90–120 with distractors)? | **Treat 150–250 as a target band**; roster realism + distractors decide; record outcome | EP-13, EP-33 |
| OQ-6 | May the imported-list surface offer one-click "seed working list as unverified rows," and is using it scoring-neutral? (Scoring semantics = owner-only.) | **Allow, scoring-neutral** (assumed; mirrors real workflow without giving answers) | EP-16, EP-12 |
| OQ-7 | Does targeted replay re-score (overwriting completion marks) or run as an **unscored replay mode**? | **Unscored replay mode** (assumed; replay banner, no signature scoring) | EP-24, EP-11 |
| OQ-8 | Golden-snapshot updates (= scoring-semantics changes) guarded by PR-template flag + owner review, or CI hard-block on non-owner branches? | **PR-template flag** (assumed; hard-block available if drift observed) | EP-8, EP-12 |
| OQ-9 | Contributor Covenant **3.0** (current) or 2.1 (shorter classic)? | **3.0** (assumed) | EP-2 |
| OQ-10 | Register `medrecsim.com` defensively (~recurring cost, conflicts with complete-at-rest) or rely on the Pages URL? | **No domain** (assumed) | EP-3 |
| OQ-11 | Standalone public case-study document in v1 scope, or v1.x polish? | **README narrative arc in v1; standalone doc = v1.x** (assumed; branch B-13) | EP-38 |
| OQ-12 | Publish a short statement of how AI-assisted authoring is used in this repo (honesty-brand consistency; wording owner-approved)? | **Yes, one owner-approved paragraph** in CONTRIBUTING/README (assumed) | EP-2 |

## Integrator resolutions (I-ledger)

Reversible technical/process questions resolved during integration under the D-EXEC-003
delegation (logged decisions, not owner rulings; any can be revisited). Cited as `I-n` from
briefs and appendices.

| ID | Resolution |
|---|---|
| I-1 | Code workspace directory keeps its current name/layout (matches sibling-project pattern; assumption A-001) |
| I-2 | Formulary ships as a versioned content directory, not an npm package (EP-8 ADR may overturn) |
| I-3 | Hybrid "Zod as source of truth + exported JSON Schema for editor tooling" is an acceptable ADR-2 outcome |
| I-4 | Local convenience state is discarded on **any** case content-version bump, not only clinical-semantics bumps |
| I-5 | Windows CI parity = build/test/content stages on PRs; Playwright e2e runs ubuntu-on-PR + windows-nightly |
| I-6 | Hint texts live in the case reference layer (public by design; schema EP may refine placement) |
| I-7 | Time-critical threshold crossings use one assertive live-region announcement each (with persistent visual state) |
| I-8 | Mid-case resume is in scope — already decided by D-ARCH-005, not a new question |
| I-9 | The fictional-universe registry (institutions/providers/pharmacies) is a shared content package beside the formulary |
| I-10 | Windows High Contrast / forced-colors support is tested-informative, not a release gate |
| I-11 | GitHub Issues only; Discussions not enabled (surface reduction) |
| I-12 | The sensitive-commit history-rewrite runbook is pre-authorized in the incident procedure; the owner personally executes it |
| I-13 | One surrogate-informant case satisfies D-CONS-001's "1–2" |
| I-14 | Joint Commission citation policy: cite archived NPSG.03.06.01 plus the successor with a transition note (SP-3 confirms) |
| I-15 | Login-gated Tier-A sources are citable via public bibliographic pointer; archived copies stay in the private zone, never committed |
| I-16 | The pre-written "stepped-away" maintenance paragraph is kept privately until needed |
| I-17 | Pre-brief sensitive-content notes are a brief neutral one-liner; depth decided per case at authoring under the stigma-safety checklist |
