# Clinical model — taxonomy, case roster, scoring, review instruments

This appendix is the canonical integrated clinical-education specification for medrecsim v1,
implemented by EP-6 (governance specs), EP-7 (taxonomy v1), EP-12 (engine scoring/debrief data),
EP-13/EP-33 (formulary waves), EP-14 and EP-26–EP-32 (case bundles), EP-24/EP-25 (debrief and
hints UI), and EP-35 (roster closure). Every design element cites its binding decision
(`D-*` in [../../DECISIONS.md](../../DECISIONS.md)); items ruled on at roadmap approval carry their `OQ-n` reference from
[open-questions.md](open-questions.md). Integrated 2026-08-23 from specialist planning; citations
carry access dates; time-sensitive facts reverify at execution.

## 1. Five-axis discrepancy taxonomy (D-TAX-001)

Draft value-sets, cited; **final enums are frozen by EP-7 and become the schema source of truth
verbatim** (EP-9 consumes them; changing them later requires a codemod migration).

### Axis 1 — Type (13 values)

1. `omission`
2. `commission`
3. `wrong-dose`
4. `wrong-frequency-schedule`
5. `wrong-route` *(optional — retained in the enum; no v1 case requires it)*
6. `wrong-formulation`
7. `wrong-strength-concentration`
8. `therapeutic-duplication`
9. `brand-generic-duplication`
10. `wrong-drug-lasa`
11. `restart-gap`
12. `status-discrepancy`
13. `allergy-record-discrepancy`

Mapping notes: *prescribed-vs-actual mismatch* is not a Type value — it is an Axis-2 mechanism
family (patient/agent-side mechanisms below); *stale import* is likewise a mechanism, not a type.
The coverage matrix (§3) tracks the **charter phenotypes** (D-TAX-002), not raw enum values.

**Sources (accessed 2026-08-23):** TJC NPSG.03.06.01 (Jan-2026 Nursing Care Center program PDF
verified; hospital-program wording **reverify at execution**); WHO High 5s Medication
Reconciliation SOP v3 (2014); MedTax (Almanasreh et al. 2019); Almanasreh et al. 2016 systematic
review. **Documented divergences from sources:** `restart-gap` is a pedagogic promotion (the
literature folds it into omission); allergy discrepancies are included as a first-class type per
D-MED-003.

### Axis 2 — Causal mechanism (grouped by intent stratum)

The literature's unintentional / undocumented-intentional split is preserved as the grouping
structure. This axis is marked a **design construct** grounded in MARQUIS/MATCH (not a verbatim
published taxonomy).

| Stratum | Values |
|---------|--------|
| System/record | `stale-record-propagation` · `transcription-error` · `lasa-confusion` · `transition-communication-gap` · `data-fragmentation` · `auto-population-default-error` |
| Undocumented intentional | `prescriber-change-undocumented` · `hold-not-documented` |
| Patient/agent-side (systems-framed per D-CONS-002/D-GOV-004) | `cost-access-barrier` · `supply-interruption` · `regimen-complexity-misunderstanding` · `informed-self-adjustment` · `language-access-barrier` |
| Epistemic | `informant-knowledge-limit` |

### Axis 3 — Detectability (7 values)

`single-source-explicit` · `cross-source-conflict` · `interview-elicited` · `artifact-dependent`
· `escalation-dependent` · `longitudinal-inference` · `irreducible`

Pedagogic construct: operationalizes multi-source BPMH practice. Every discrepancy declares ≥1
detectability path (D-DATA-003); `irreducible` items must preserve authored uncertainty and admit
"unable to verify" in their accepted action set (D-MED-005, invariant INV-DISC-003 in
[architecture.md](architecture.md)).

### Axis 4 — Urgency (ordinal U1–U4)

| Value | Meaning |
|-------|---------|
| U1 | Routine |
| U2 | Prompt — resolve this shift |
| U3 | Urgent — before the next dose decision |
| U4 | Immediate / time-critical (anchored to the ISMP/CMS ±30-minute time-critical medication concept) |

### Axis 5 — Harm class (three ordinal sub-scales, D-SCOR-001/D-SCOR-003)

- **Severity S0–S4**, anchored to the NCC MERP Index (2022) read as **potential worst-credible
  outcome** — this adaptation of MERP (which indexes actual outcomes) must be stated wherever the
  scale is presented.
- **Reversibility**: 3-level ordinal.
- **Time-to-harm**: 4-level ordinal — `immediate` / `hours-to-a-day` / `days` / `weeks-plus`.

**Documentation requirement:** urgency ≠ time-to-harm (workflow priority vs physiologic tempo);
the taxonomy doc must state the distinction explicitly. Potential-harm stance follows MARQUIS.
No probabilities or invented statistics anywhere on this axis (D-SCOR-003).

## 2. Case roster — 11 cases (approved per the OQ-2 ruling)

Tiers per D-TAX-004: introductory C01–C02, core C03–C07 + C10, advanced C08, C09, C11
(2/6/3). Each case is a fully authored deterministic bundle (D-CASE-001, D-GOV-003) ending at an
owner sign-off gate with a public review record badged "physician-reviewed (single reviewer)"
(D-CLIN-001, D-RISK-003). Slack option recorded: C02 is mergeable to reach a 10-case roster —
**not recommended**.

- **C01 "Three Lists"** *(introductory; EP-14; the R1 vertical-slice case)* — Cellulitis
  admission; organized historian with a handwritten med list vs a 2-year-stale imported EHR list.
  Discrepancies: stale-import/commission (amlodipine), omission (OTC ibuprofen + calcium/vitamin D),
  wrong-frequency (levothyroxine with a weekly "holiday" pattern). Record-is-wrong case #1
  (D-CASE-002). Deliberately contains **no high-alert medication**.
- **C02 "Twice the Same Medicine"** *(introductory; EP-26)* — Syncope; two pharmacies and two
  prescribers. Brand/generic duplication (metoprolol succinate listed generically and again under
  a fictional brand label — real brand names are banned by D-DATA-001/INV-SCOPE-001; the formulary
  supplies `brandNamesFictional`), therapeutic
  duplication (omeprazole + pantoprazole), commission (HCTZ never-started). Scored escalations:
  community pharmacy + PCP office.
- **C03 "Pillbox and the OR"** *(core; EP-27)* — Apixaban for AF + hip fracture, surgery in the
  morning; wife-managed pillbox. Wrong-dose (pillbox 5 mg BID vs clinically reduced 2.5 mg),
  omission (OTC naproxen), status-discrepancy (old warfarin bottle). Anticoagulant
  periprocedural hold/bridge is **escalation-only** (D-TAX-003): a learner-authored bridging plan
  sits in the unsafe set. U3 pressure: last-dose timing vs surgery.
- **C04 "Stretching the Refills"** *(core; EP-28)* — Rule-out ACS; insurance-coverage lapse led
  to glimepiride every-other-day and statin stopped (cost-access systems framing), LASA
  (glipizide/glimepiride transcription error in an outpatient note), commission (ezetimibe
  never started). Fill-gap detection via longitudinal inference on dispensing history.
  Irreducible element: the exact stretching pattern is only approximable. Pharmacist escalation
  models assistance-program referral.
- **C05 "Held, Not Stopped"** *(core; EP-27)* — PMR on chronic prednisone admitted with
  pneumonia; an urgent-care note says "steroids stopped" (wrong), the ED list omits prednisone.
  Omission + restart-gap (adrenal suppression hazard, D-TAX-003) + status-discrepancy. PCP
  callback is the definitive and required verification. U3: the evening dose decision.
- **C06 "In Her Own Words"** *(core; EP-26)* — Spanish-preferring grandmother, HF exacerbation;
  professional interpreter is the modeled-correct action, grandson ad-hoc interpretation modeled
  lower-reliability (D-CONS-002). Wrong-frequency (furosemide daily vs BID after English-only
  instructions), omission (herbal tea + potassium supplement), **allergy-record discrepancy**
  (chart "penicillin — anaphylaxis" vs childhood nausea plus recent amoxicillin tolerance) as a
  scored allergy sub-task (D-MED-003). Record-is-wrong case #2. Stigma-safety review emphasis.
- **C07 "On Time, Every Time"** *(core; EP-28)* — Parkinson disease + urosepsis; five
  custom-timed levodopa doses/day vs record "TID". Wrong-frequency-schedule, wrong-formulation
  (IR vs CR), omission (entacapone). The U4 time-critical **clock case** (D-TAX-003, D-WF-002):
  a deterministic delay → symptom event fires and is surfaced in the debrief. Reliable historian
  by design (contrast case).
- **C08 "Continuity"** *(advanced; EP-29)* — Opioid-use-disorder therapy: methadone via an
  opioid-treatment program (OTP) + cholecystitis; methadone absent from **all** electronic
  sources (absence-as-evidence teaching); federal OTP dose-verification required; the OTP opens
  06:00. Omission/data-fragmentation, wrong-dose **risk** (patient report correct but must be
  verified), unknown-to-source claims. Irreducible until morning: deferred-with-follow-up-plan is
  the scored-correct terminal state (D-WF-004). Person-first language per NIDA (stigma
  checklist). Spike SP-2 (SAMHSA 42 CFR Part 8) precedes authoring. The OTP call rides the
  "outpatient prescriber/program office" channel per the **OQ-3** ruling.
- **C09 "Gap in the Fill History"** *(advanced; EP-30)* — HIV: bictegravir/FTC/TAF lapsed 3
  months (prior-authorization failure); both the imported record and the discharge summary list
  it active (record-is-wrong #3). Commission + **restart-gap (the phenotype-of-record case per
  the charter)** + stale import. Community-pharmacy fill history is the decisive longitudinal
  inference. Irreducible: the exact stop date is a range, never a point. Escalations: HIV clinic
  (via the "outpatient prescriber/program office" channel, **OQ-3** ruling) + inpatient
  pharmacist.
- **C10 "Units of Insulin"** *(core; EP-31; the surrogate case, D-CONS-001,
  integrator resolution I-13: one surrogate case satisfies "1–2")* — HHS, obtunded patient;
  daughter is the documented health-care agent (authorization explicit in-case; capacity
  assessment is authored fact). U-500 insulin + mealtime U-100 aspart vs record "insulin regular
  60 units TID": wrong-strength-concentration (ISMP U-500 high-alert), wrong-dose,
  informed-self-adjustment; second allergy sub-task ("sulfa" → remote TMP-SMX rash with
  tolerated glipizide). Record-is-wrong #4. EMS-bagged vial artifacts are the decisive evidence.
  Inpatient-pharmacist escalation **required**.
- **C11 "Four Days"** *(advanced; EP-32)* — Psychiatric medication continuity: clozapine ×4-day
  lapse (pharmacy transfer/REMS snag); the record lists the full dose as active; community
  mental-health nurse collateral (consented, authored). Restart-gap ≥48 h ⇒ retitration
  required — "continue home meds" is the anchored **unsafe** action. Supply-interruption
  systems framing. Spike SP-1 (current clozapine REMS/label retitration wording) precedes
  authoring. **Clozapine confirmed by the OQ-1 ruling** (lithium remains documented as a
  drop-in variant if ever revisited).

## 3. Coverage matrix (phenotype × case)

● = primary coverage (the case's designed exemplar of the phenotype) · ○ = secondary/reinforcing.
Rows are the D-TAX-002 must-cover phenotypes; every row has ≥1 primary ●, so **11 cases suffice**
within the 8–12 band of D-PROD-005 (count approved by the **OQ-2** ruling). This table is the planning
reconstruction from the roster above; the executable source of truth is the `coverage` CLI
output computed from case metadata (EP-20), which must reproduce it.

| Must-cover phenotype (D-TAX-002) | C01 | C02 | C03 | C04 | C05 | C06 | C07 | C08 | C09 | C10 | C11 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Omission | ○ | | ○ | | ● | ○ | ○ | ● | | | |
| Commission | ● | ● | | ○ | | | | | ○ | | |
| Wrong dose/frequency/formulation | ○ | | ● | | | ○ | ● | | | ○ | |
| Therapeutic + brand/generic duplication | | ● | | | | | | | | | |
| Look-alike/sound-alike | | | | ● | | | | | | | |
| Prescribed-vs-actual mismatch (incl. affordability-driven) | ○ | | | ● | | | | | | ○ | |
| Restart gap | | | | | ○ | | | | ● | | ○ |
| Stale-import error | ● | | | | | | | | ○ | | |
| Unit/concentration error (insulin) | | | | | | | | | | ● | |
| Allergy-list discrepancy | | | | | | ● | | | | ○ | |

Notes: C05 and C11 restart gaps *reinforce* the phenotype; C09 is the phenotype-of-record per the
charter. Record-is-wrong cases (D-CASE-002, ≥2 required): C01, C06, C09, C10. High-alert mix per
D-TAX-003 + D-CONS-003: anticoagulant (C03), corticosteroid restart (C05), levodopa time-critical
(C07), methadone/OTP (C08), ART restart (C09), insulin concentration (C10), clozapine (C11,
OQ-1).

## 4. Scoring computation spec (D-SCOR-001/002/003; implemented in EP-12)

Global rules: every subscore is a **transparent per-item tally** — each authored scoreable item
resolves to met / partially-met / not-met, displayed as x-of-y with rationale; **no composite
number**; all weights are ordinal-tier lookups, never arithmetic on numbers.

1. **Information seeking & prioritization.** Authored inputs: per-evidence-unit yield tags
   (`critical` / `corroborating` / `low-yield`), time costs, and per-discrepancy detectability
   **sufficiency sets**. Computation: *coverage* = critical evidence units accessed before
   signature; *prioritization* = critical evidence for U3/U4 discrepancies accessed before
   low-yield units, judged in sim-time order. Thoroughness is **never penalized**. Partial
   credit: an incomplete sufficiency set.
2. **Discrepancy detection (urgency/harm-weighted).** Authored inputs: an
   accepted-classification set per discrepancy; a weight lookup (urgency, severity) →
   `standard` / `elevated` / `critical` **display tiers** — no cross-tier arithmetic.
   Computation: full = discrepancy logged with an accepted classification before signature;
   partial = misclassified, or found only after a reveal-tier hint; miss = absent at signature.
3. **Action safety.** Computation: pattern-match of the learner's admission action list against
   authored accepted / partially-accepted / unsafe sets (D-SCOR-002). Unsafe actions are never
   blocked in-sim; each fires a mechanism-of-harm card in the debrief. Authoring requirement:
   every case carries a **default band for unlisted actions** so the full action space is
   classified — validator-enforced (INV-ACT-001/002).
4. **Uncertainty & escalation handling.** Computation: required expected-escalations met
   (D-CLIN-002); **unnecessary escalation is never penalized** (safety-culture rule). Scored
   failures: false certainty on an irreducible item; an unresolved discrepancy carried to
   signature without an escalation or documented rationale (D-WF-004). Deferred-with-plan on a
   *resolvable* item = partial credit + a debrief pointer to the missed path.
5. **Documentation quality.** Computation: completeness (required fields present on all three
   artifacts) + rationale-menu match against authored rationales (D-MED-004; no free text).

### Hint rendering (D-PED-001; EP-25)

The engine records every hint event as (tier: nudge/directed/reveal-source, target, sim-time,
sequence). Hints **never subtract score**. Debrief rendering: neutral annotations on the
timeline plus a support-summary panel; a detection made after a reveal-tier hint renders as
"partially met — found with support"; hint indicators never use negative color or iconography.

### Debrief data contract (D-PED-002; EP-12 produces, EP-24 renders; golden-locked)

The debrief consumes an engine-derived **event log** (never authored directly): evidence-access
events; dialogue events (including the interpreter channel); escalation events
(initiated / latency / response-received); artifact-edit events (before/after); clock events and
fired authored triggers; hint events; and the terminal signature with frozen snapshots of the
three artifacts. This log **joins** against authored reveal cards and the dual event/documentation
timestamps (D-MED-002) to derive the what-was-knowable-when timeline: the
**earliest-knowable / accessed / logged** triple per discrepancy is the overlay spine. The whole
contract is pinned by golden-case snapshots (see [architecture.md](architecture.md)).

## 5. Clinical self-review checklist — outline (D-CLIN-001, D-GOV-001; EP-6)

Twelve sections; executing it and committing the signed public record is part of every case EP's
definition of done.

1. Truth-layer consistency (reference vs evidence layer, D-MED-005).
2. Clinical plausibility of the whole scenario.
3. BPMH-process fidelity — ≥2 corroborating sources per key fact; MARQUIS BPMH interview
   domains represented in the question menus.
4. High-alert audit vs the current ISMP high-alert list + ISMP Targeted Best Practices
   (levodopa ±30-minute handling, U-500 handling, anticoagulant escalation-only confirmation).
5. LASA audit vs ISMP Confused Drug Names list + tall-man lettering flags.
6. Discrepancy-metadata audit — all five axes populated, detectability paths real, ordinals
   defensible.
7. Accepted/unsafe action-set audit — full action space classified; no unsafe action reachable
   through an accepted rationale.
8. Escalation realism (availability windows, latencies, OTP hours, etc.).
9. Harm-language audit (D-SCOR-003).
10. Citation completeness (D-GOV-002).
11. Scope/claims audit (nothing in the case implies an unclaimed capability).
12. Sign-off block: reviewer / credential / date / checklist version / content version /
    disposition → becomes the public review record with badge fields (D-RISK-003), rendered
    outward as "physician-reviewed (single reviewer)".

## 6. Stigma-safety checklist — outline (D-GOV-004, D-CONS-002; EP-6)

Eleven items; runs after the clinical self-review in the D-GOV-001 lifecycle.

1. Person-first language throughout (NIDA "Words Matter", APA bias-free language, AMA style).
2. Banned terms absent: "clean"/"dirty", "non-compliant", "denies".
3. Recurrence framed as recurrence, never relapse-as-moral-failure.
4. Systems framing verified for every adherence/access discrepancy.
5. No diagnosis-as-identity; characters have non-clinical texture.
6. **Aggregate** demographic-stereotype audit across the whole roster (executed at EP-35).
7. Elder, surrogate, and interpreter-mediated patients retain agency.
8. Patient-credibility tone check (patients/caregivers are often the correct source —
   D-CASE-002).
9. No clinician-cynicism tropes in NPC dialogue.
10. No patient-experience claims anywhere (D-GOV-004).
11. Sign-off block (same fields as §5.12).

## 7. Citation format and source tiers (D-GOV-002; EP-6)

Citation record (YAML): `{id, claim, source, publisher, title, version-or-date, url, accessed,
tier, notes}`.

| Tier | Definition | Examples |
|------|-----------|----------|
| A | Regulatory / national safety body | FDA/DailyMed, ISMP, The Joint Commission, WHO, AHRQ, NCC MERP, CDC/NIH (incl. clinicalinfo.hiv.gov), SAMHSA |
| B | Professional-society guidelines | ADA, ACC/AHA/CHEST, ASHP, AGS Beers, APA |
| C | Peer-reviewed literature | construct grounding (taxonomies, MARQUIS/MATCH) |
| D | Tertiary summaries | color only — **never sole support for a scored rule** |

Rules: every scored clinical rule cites ≥1 Tier A or B source; login-gated Tier-A sources
(e.g., ISMP/ECRI members-only lists) are citable with a public bibliographic pointer plus a
private archived copy kept under the `.local/` convention, never committed (integrator
resolution I-15, consistent with D-DATA-006).

## 8. Clinical source list (all accessed 2026-08-23)

AHRQ MATCH toolkit · MARQUIS final report + MARQUIS2 protocol + AHRQ PSNet coverage · WHO High
5s Medication Reconciliation SOP v3 (2014) + fact sheet + Medication Without Harm + WHO 2019
transitions-of-care report (paired because the SOP is dated) · ISMP high-alert list (acute care,
2024) + Targeted Medication Safety Best Practices (2024–25) + Confused Drug Names (2023) +
Parkinson delayed-dose harm literature (PMC) · TJC NPSG.03.06.01 (Jan-2026 Nursing Care Center
PDF verified; hospital-program PDF **reverify**) + NPSG→NPG transition coverage (secondary;
spike SP-3 confirms successor wording; cite-both per integrator resolution I-14) · NCC MERP
Index (2022) · Almanasreh 2016 + MedTax 2019 (abstract-level access only — **reverify full text
at authoring**) · NIDA Words Matter (×2) · APA bias-free language · AMA style (via secondary
source — cite the Manual directly at authoring).

Known fetch failures at planning time, all flagged **reverify at execution**: WHO High 5s SOP
PDF (binary fetch), TJC hospital-program PDF, jointcommission.org 403. Source-drift risk
(ISMP→ECRI consolidation, NPSG→NPG renumbering) is mitigated by version + access dates on every
citation and the annual re-review trigger (D-GOV-001).
