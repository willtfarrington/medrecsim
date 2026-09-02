# Discrepancy taxonomy v1 (D-TAX-001)

**Instrument version:** 1.0 · **Date:** 2026-09-02 · **Instantiated by:** EP-7 from
[roadmap/appendices/clinical-model.md](../../roadmap/appendices/clinical-model.md) §1 ·
**Status:** value-sets and ordinal anchors **owner-approved 2026-09-02** (§11); tokens in §8 are
spelling-frozen from that ruling and become schema enums at EP-9 · **Changes:** owner-only. After EP-9 stamps these values into the content schema, any
change to a token in §8 is a schema migration and ships with a codemod (D-DATA-002).

This document is the source of truth for the five discrepancy-metadata axes every authored
discrepancy carries (D-TAX-001): **type × causal mechanism × detectability × urgency × harm
class**. The content schema (EP-9) imports the tokens in §8 **verbatim**; the coverage tool
(EP-20) derives the case-mix coverage matrix from the phenotype predicates in §6; the scoring
engine (EP-12) reads the ordinals in §4–§5 as display-tier lookups, never as arithmetic
(D-SCOR-001). Allergy and intolerance records use the same machinery (D-MED-003; §1 value 13).

Citation conventions follow [CITATION-POLICY.md](CITATION-POLICY.md): every value below carries
at least one citation id in square brackets, resolved in the register in §9 (ten-key records
with version and access date). Tier A/B records anchor rules; Tier C records ground constructs.
Three axes are **design constructs** (mechanism, detectability, and the harm sub-scales beyond
severity) grounded in the cited literature rather than copied from it; §7 says exactly where
this document departs from each source and why.

Harm language throughout follows D-SCOR-003: ordinal labels describe the *potential
worst-credible outcome*; no probabilities, frequencies, or invented statistics appear in any
definition, and the only numbers in this document are quoted from the cited source that
states them.

## 0. Conventions

- **Tokens** are lowercase ASCII kebab-case (`wrong-frequency-schedule`), except ordinal tokens,
  which are a capital letter plus digit (`U3`, `S2`). Tokens are the schema enum values; the
  **labels** beside them are display strings the UI may localize or reword without a migration.
- Every value has a *definition*, a *boundary* ("counts when / does not count when") so
  authors classify consistently, and *citations*.
- A discrepancy is the disagreement between what the authored reference layer establishes the
  patient was actually taking (or is actually allergic to) before admission and what any
  learner-observable source or the admission orders assert (D-MED-005). Each authored
  discrepancy carries **exactly one** type, **one primary** mechanism (optional secondary
  mechanisms are an EP-9 shape decision), **one or more** detectability paths, one urgency, and
  all three harm ordinals (invariant INV-DISC-001).
- "Prescribed-versus-actual mismatch" and "stale import" in D-TAX-002 are **not** types: they are
  mechanism families (§2) and the coverage predicates in §6 read them from the mechanism axis.

## 1. Axis 1 — Type (13 values)

What is wrong, stated from the record's point of view. Anchored to the Joint Commission's
discrepancy note ("omissions, duplications, contraindications, unclear information, and
changes") and its listed medication-information elements ("name, dose, route, frequency,
purpose") [cit-tjc-npg-14-05-01-2026, cit-tjc-npsg-03-06-01-2025], to the WHO High 5s
definition of the best possible medication history as "a 'snapshot' of the patient's actual
medication use, even though it may be different from what was prescribed"
[cit-who-high5s-sop-2014], and to the MedTax two-level structure (medication mismatched /
medication partially matched) [cit-medtax-2019, cit-imfeld-medtax-2020].

| # | Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|---|
| 1 | `omission` | Omission | A medication the patient was actually taking before admission is absent from the source or order set under review. | Counts when the medication is missing entirely. Does not count when it is present with a wrong attribute (use 3–7) or present but marked with a wrong status (use 12). The literature's single most reported discrepancy type. | [cit-tjc-npg-14-05-01-2026], [cit-medtax-2019] (MedTax 1.1), [cit-cornish-2005], [cit-almanasreh-review-2016] |
| 2 | `commission` | Commission | A medication appears in the source or order set that the patient was not actually taking before admission (never started, completed, or stopped long ago and never removed). | Counts when the listed medication has no current actual-use basis. Does not count when the patient stopped it recently and the record has not caught up — that is `status-discrepancy` with mechanism `stale-record-propagation`, unless the author has established the medication was never in use. | [cit-tjc-npg-14-05-01-2026], [cit-medtax-2019] (MedTax 1.2 "commission (or addition)"), [cit-gleason-match-2010] |
| 3 | `wrong-dose` | Wrong dose | The medication is present but the dose per administration differs from actual use. | Counts for a different amount per dose (including "number of units" per dose). Does not count for a different strength of the product itself (use 7) or a different interval (use 4). | [cit-tjc-npg-14-05-01-2026] ("dose"), [cit-medtax-2019] (MedTax 2.2), [cit-who-high5s-sop-2014] |
| 4 | `wrong-frequency-schedule` | Wrong frequency or schedule | The medication is present but the dosing interval, timing, or schedule pattern differs from actual use (including custom timing and intermittent patterns such as weekly "holidays" or every-other-day use). | Counts for interval and clock-time differences. Time-critical schedules are still this type; the urgency axis (U4) carries the time-critical weight. | [cit-tjc-npg-14-05-01-2026] ("frequency"), [cit-medtax-2019] (MedTax 2.2 and 2.4), [cit-ismp-timely-admin-2011] |
| 5 | `wrong-route` | Wrong route *(retained; no v1 case requires it — §7.6)* | The medication is present but the route of administration differs from actual use. | Counts only when the route itself differs (for example, oral versus transdermal of the same agent). A route change implied by a different formulation is classified as 6. | [cit-tjc-npg-14-05-01-2026] ("route"), [cit-medtax-2019] (MedTax 2.3 "dosage form/route of administration") |
| 6 | `wrong-formulation` | Wrong formulation | The medication is present but the dosage form or release profile differs from actual use (immediate-release versus extended-release; tablet versus liquid). | Counts when the product form differs. Does not count for strength or concentration differences of the same form (use 7). | [cit-tjc-npg-14-05-01-2026] ("changes"), [cit-medtax-2019] (MedTax 2.3) |
| 7 | `wrong-strength-concentration` | Wrong strength or concentration | The product strength or concentration recorded differs from the one actually used, so a correctly transcribed dose expression yields a different delivered amount (unit and concentration hazards). | Counts for concentration and strength mismatches, including insulin concentration. Does not count for a per-dose amount difference on the correct product (use 3). Insulin, and U-500 insulin in particular, is a high-alert exemplar. | [cit-ismp-high-alert-acute-2024], [cit-medtax-2019] (MedTax 2.2 "strength"), [cit-tjc-npg-14-05-01-2026] |
| 8 | `therapeutic-duplication` | Therapeutic duplication | Two or more agents of the same therapeutic class (or the same agent under two records) are present without an established clinical reason. | Counts when the agents differ (same class). Does not count when the same generic appears twice under different names (use 9). | [cit-tjc-npg-14-05-01-2026] ("duplications"), [cit-medtax-2019] (MedTax 1.3) |
| 9 | `brand-generic-duplication` | Brand/generic duplication | The same active ingredient appears twice because one entry carries a brand (fictional in medrecsim, D-DATA-001) or alternative name and the other a generic name. | Counts only for the same ingredient. The BPMH records "medication name (generic and brand)" for exactly this reason. | [cit-who-high5s-sop-2014], [cit-medtax-2019] (MedTax 2.1 sub-type "different brand name but same generic name"), [cit-tjc-npg-14-05-01-2026] |
| 10 | `wrong-drug-lasa` | Wrong drug (look-alike / sound-alike) | The record names a different medication than the one actually taken, and the two names form a confused-name pair. | Counts only when the pair appears on the current ISMP confused-names list or the formulary's LASA partner set (INV-REF-002). A wrong drug that is not a confused-name pair is `commission` plus `omission` on the two agents. | [cit-ismp-confused-names-2024], [cit-medtax-2019] (MedTax 2.1) |
| 11 | `restart-gap` | Restart gap | A medication the patient is prescribed and is recorded as taking has in fact lapsed for a clinically meaningful interval, so the safe next action is not "continue" but a restart decision (retitration, re-initiation, or specialist verification). | Counts when the lapse itself changes the correct action. Does not count for a single recently missed dose (that is `status-discrepancy` or no discrepancy). A **pedagogic promotion** out of omission/status: §7.1. | [cit-dailymed-clozapine-mylan-2026], [cit-nih-arv-interruption-2022], [cit-marquis-bpmh-pocket-2024] (adherence domain) |
| 12 | `status-discrepancy` | Status discrepancy | The medication is present and its attributes match, but its claim status (D-MED-001: prescribed / dispensed / taking-as-directed / taking-differently / held / self-discontinued / stopped / completed / restarted / never-started / unknown) differs from actual use — for example, a record showing "active" for an agent the patient was told to hold, or "stopped" for one still taken. | Counts when only the status disagrees. Does not count when a lapse changes the safe action (use 11) or when the agent was never used (use 2). | [cit-who-high5s-sop-2014] ("snapshot of the patient's actual medication use"), [cit-tjc-npg-14-05-01-2026] ("unclear information"), [cit-medtax-2019] (MedTax 2.5 "duration or length of the therapy") |
| 13 | `allergy-record-discrepancy` | Allergy or intolerance record discrepancy | The allergy/intolerance record disagrees with the verified history on substance, reaction, severity, timing, or verification status — including a recorded allergy to an agent the patient has since tolerated, and a missing record of a true reaction. | Uses the same five axes as medication discrepancies (D-MED-003). Counts for any disagreement in the USCDI allergy elements (substance, reaction) or their verification. Included as a first-class type by decision: §7.2. | [cit-onc-uscdi-allergies-2026], [cit-aaaai-acaai-drug-allergy-2022], [cit-medtax-2019] (MedTax 1.5 "allergy or intolerance") |

## 2. Axis 2 — Causal mechanism (14 values, four strata)

Why the disagreement exists. **This axis is a design construct** grounded in the MARQUIS and
MATCH programmes and in the WHO High 5s discrepancy categories, not a verbatim published
taxonomy (adaptation statement required by CITATION-POLICY.md §3). The literature's split
between *unintentional* discrepancies and *undocumented intentional* discrepancies
[cit-who-high5s-sop-2014, cit-almanasreh-review-2016] is preserved as the grouping structure:
the first stratum is the unintentional family; the second is the undocumented-intentional
family; the third and fourth strata extend the construct to the patient-side and epistemic
causes that MARQUIS's history-error findings [cit-pippins-2008, cit-salanitro-marquis-2013]
and MARQUIS2's patient-level interventions [cit-schnipper-marquis2-2022] and the BPMH
interview domains [cit-marquis-bpmh-pocket-2024] make visible but the intent
split does not name (divergence note §7.4). Patient-side mechanisms are **systems-framed**
by decision (D-CONS-002, D-GOV-004): they describe access, supply, complexity, and language
conditions, never patient character, and the stigma-safety checklist item SS-04 verifies the
framing in every case.

### Stratum A — system/record (unintentional)

| Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|
| `stale-record-propagation` | Stale record propagated | An earlier record (imported medication list, prior discharge summary, outpatient note) was carried forward without re-verification, so an out-of-date fact now reads as current. | The mechanism behind the D-TAX-002 "stale-import error" phenotype. Counts when the source is a copy of an older source. Does not count when the older source was itself correct at the time and a later *undocumented* clinical change is the cause (Stratum B). | [cit-ahrq-psnet-medrec-2024], [cit-pippins-2008] (history errors), [cit-tjc-npg-14-05-01-2026] (EP 1 note 2) |
| `transcription-error` | Transcription error | A human copying step introduced a wrong attribute (dose, frequency, strength, name) between two records. | Counts for slips in copying. A copying slip that lands on a confused-name pair is `lasa-confusion`. | [cit-gleason-match-2010], [cit-cornish-2005] |
| `lasa-confusion` | Look-alike / sound-alike confusion | A name pair on the confused-names list was substituted at some step (verbal order, handwriting, dropdown selection). | Pairs with type `wrong-drug-lasa` or with a wrong attribute when the pair differs by strength or form. | [cit-ismp-confused-names-2024] |
| `transition-communication-gap` | Transition communication gap | Information that existed at a previous transition (discharge, clinic visit, pharmacy change) was not communicated to the next setting or to the patient. | Counts when the information existed somewhere and did not travel. WHO names transitions of care a global priority area. | [cit-tjc-npg-14-05-01-2026] (EP 5), [cit-who-mwh-2017], [cit-mueller-review-2012] |
| `data-fragmentation` | Data fragmentation | The true picture is split across several prescribers, pharmacies, programmes, or record systems that do not see each other, so no single source is complete. | Counts when each source is internally consistent and the disagreement only appears across sources. Multiple pharmacies and prescribers are recognised risk factors for history errors. | [cit-gleason-match-2010], [cit-who-high5s-sop-2014] (BPMH uses "a number of different sources"), [cit-ahrq-psnet-medrec-2024] |
| `auto-population-default-error` | Auto-population / default error | An electronic system supplied a default (dose, frequency, route, form) or auto-populated a field that a human accepted without correction. | Counts for system-suggested values. AHRQ describes decision-support systems that suggest "default values for drug doses, routes of administration, and frequency" and the generation of new error types by order-entry systems. | [cit-ahrq-psnet-cpoe-2025], [cit-schnipper-marquis-2018] |

### Stratum B — undocumented intentional

| Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|
| `prescriber-change-undocumented` | Prescriber change not documented | A prescriber intentionally added, changed, or stopped a medication, and that choice "is not clearly documented" in the sources the learner can see. | WHO's *undocumented intentional* category, applied to adds, changes, and stops. | [cit-who-high5s-sop-2014], [cit-almanasreh-review-2016] |
| `hold-not-documented` | Hold not documented | A clinician intentionally paused a medication (peri-procedural hold, hold pending a level or lab, temporary stop) and the pause was not recorded, so the record shows it active. | The hold-specific case of the category above, split out because the correct action differs (resume decision versus stop decision). Post-admission holds are post-T0 actions and cannot be the cause of a pre-admission discrepancy (D-MED-002). | [cit-who-high5s-sop-2014], [cit-tjc-npg-14-05-01-2026] ("changes") |

### Stratum C — patient/agent-side, systems-framed

| Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|
| `cost-access-barrier` | Cost or access barrier | The patient could not obtain or afford the medication as prescribed (coverage lapse, prior-authorization failure, copay, pharmacy access), and actual use changed as a result. | The mechanism for the D-TAX-002 "affordability/access-driven" sub-requirement. Framed as a system condition; the CDC documents "did not take their medication as prescribed" as a cost-reduction strategy adults report. | [cit-cdc-nchs-db333-2019], [cit-who-high5s-sop-2014] (BPMH records actual use) |
| `supply-interruption` | Supply interruption | The medication was unavailable to the patient for reasons outside their control (manufacturer shortage, pharmacy transfer, programme or REMS enrolment lapse, dispensing delay). | Distinct from cost: the patient could pay but could not obtain. FDA maintains the public shortage record. | [cit-fda-drug-shortages-2026], [cit-dailymed-clozapine-mylan-2026] |
| `regimen-complexity-misunderstanding` | Regimen complexity or misunderstanding | The patient's understanding of the regimen (which product, how often, with what) differs from the prescriber's intent because of regimen complexity, instructions, or health-literacy demands. | Counts when the difference is an understanding gap rather than a chosen adjustment (compare the next value). Low patient understanding of preadmission medications is an established predictor of potentially harmful discrepancies. | [cit-pippins-2008], [cit-who-mwh-2017] (polypharmacy priority area), [cit-marquis-bpmh-pocket-2024] |
| `informed-self-adjustment` | Informed self-adjustment | The patient (or caregiver) deliberately takes the medication differently from the prescription, with their own reasons (side effects, effect, schedule, prior advice), and the record does not reflect it. | Counts for a chosen pattern the patient can describe. The BPMH exists precisely to capture actual use "even though it may be different from what was prescribed". Systems-framed: the record's failure to capture the choice is the discrepancy. | [cit-who-high5s-sop-2014], [cit-marquis-bpmh-pocket-2024] (adherence questions) |
| `language-access-barrier` | Language-access barrier | Instructions or history were exchanged without a qualified interpreter, so the patient's understanding or the clinician's record was formed across a language barrier. | Professional interpretation is the modeled-correct action (D-CONS-002); ad-hoc interpretation is modeled lower-reliability. | [cit-ahrq-lep-guide-2012], [cit-who-high5s-sop-2014] (interview with patient and/or family) |

### Stratum D — epistemic

| Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|
| `informant-knowledge-limit` | Informant knowledge limit | No available informant (patient, caregiver, surrogate, or source) knows the fact; the disagreement is between an assertion and an unknown, not between two assertions. | The mechanism for claims whose status is `unknown-to-source` (D-MED-001). Counts when the reference layer marks the fact conditionally discoverable or intentionally unknowable (D-MED-005). The Joint Commission's "good faith effort" note and WHO's fallback to other sources recognise the limit. | [cit-tjc-npg-14-05-01-2026] (EP 1 note 2), [cit-who-high5s-sop-2014], [cit-pippins-2008] |

## 3. Axis 3 — Detectability (7 values)

How a diligent learner can come to know the discrepancy. **A pedagogic design construct** that
operationalises multi-source BPMH practice: the WHO protocol's "number of different sources of
information" [cit-who-high5s-sop-2014], MARQUIS's "at least two sources" [cit-marquis-bpmh-pocket-2024],
and ISMP Best Practice 21's "clarify with at least one outside resource"
[cit-ismp-tmsbp-bp21-2026]. Every discrepancy declares **one or more** paths (INV-DISC-001);
each declared path must be reachable in the authored evidence graph (INV-DISC-002); and an
`irreducible` discrepancy must have **no** complete path and must admit "unable to verify" in
its accepted action set (INV-DISC-003; D-MED-005, D-WF-004).

| Token | Label | Definition | Boundary | Citations |
|---|---|---|---|---|
| `single-source-explicit` | Explicit in one source | One learner-observable source states the fact outright; reading that source is sufficient. | Counts when no comparison is needed. The rarest path for a designed discrepancy; typical for the pre-brief's initially-known facts. | [cit-tjc-npg-14-05-01-2026] (EP 1 documented list), [cit-who-high5s-sop-2014] |
| `cross-source-conflict` | Cross-source conflict | Two or more sources disagree, and the disagreement itself is the signal; resolving it requires a third source or a judgement. | Counts when any pair of sources conflicts on the fact. | [cit-who-high5s-sop-2014], [cit-marquis-bpmh-pocket-2024], [cit-ismp-tmsbp-bp21-2026] |
| `interview-elicited` | Elicited by interview | The fact surfaces only through the structured patient or informant interview (specific question menus, D-SIM-001), including the interpreter channel. | WHO: other sources "should never be a substitute for a thorough patient and/or family medication interview where it is possible". | [cit-who-high5s-sop-2014], [cit-marquis-bpmh-pocket-2024] |
| `artifact-dependent` | Artifact-dependent | The fact is visible only on a physical artifact (bottle label, pillbox, handwritten list, bagged vials). | Presenting bottles or a list at admission is associated with fewer history errors. | [cit-gleason-match-2010], [cit-marquis-bpmh-pocket-2024] |
| `escalation-dependent` | Escalation-dependent | The fact is obtainable only through one of the four scored escalation channels (community pharmacy; outpatient prescriber/programme office; inpatient pharmacist; senior/attending — D-CLIN-002, OQ-3). | Counts when in-chart and interview sources cannot settle it. Regulatory verification duties (for example opioid-treatment-programme dose confirmation) are cited at case authoring. | [cit-ismp-tmsbp-bp21-2026], [cit-tjc-npg-14-05-01-2026] (EP 3 "qualified individual") |
| `longitudinal-inference` | Longitudinal inference | The fact is not stated anywhere but can be inferred from a pattern over time — fill history gaps, refill intervals, dated notes, dose-count arithmetic. | Counts when inference from dated evidence is required. Dispensing history (D-WF-001 source 6) is the usual substrate. | [cit-marquis-bpmh-pocket-2024] (adherence and last-dose domains), [cit-gleason-match-2010] |
| `irreducible` | Irreducible | No path available in the case resolves the fact; the correct terminal state is "unable to verify" or "deferred with a follow-up plan". | Never co-declared with any other path (INV-DISC-003). The Joint Commission's "good faith effort" standard is the clinical basis for an honest unresolved state. | [cit-tjc-npg-14-05-01-2026] (EP 1 note 2), [cit-who-high5s-sop-2014] |

## 4. Axis 4 — Urgency (ordinal U1–U4)

How soon, in **workflow** time, the discrepancy must be acted on. Urgency is a scheduling
priority for the admitting clinician; it is **not** the physiologic tempo of harm (§5.4). The
U4 anchor is the ISMP/CMS time-critical definition, used as a class rule per
CITATION-POLICY.md §3.

| Token | Label | Definition (act by) | Anchor | Citations |
|---|---|---|---|---|
| `U1` | Routine | Before the admission reconciliation is complete and signed; no single order or dose depends on it. | The reconciliation cycle itself: WHO's expectation that medications are reconciled within 24 hours of the decision to admit; the Joint Commission's requirement to identify and resolve discrepancies. | [cit-who-high5s-sop-2014], [cit-tjc-npg-14-05-01-2026] (EP 3) |
| `U2` | Prompt — this shift | Before handing the patient over; a pending order, plan, or escalation this shift depends on it. | Same cycle, bounded by the handoff so the information travels with the patient (transition-of-care duty). | [cit-tjc-npg-14-05-01-2026] (EP 3, EP 5), [cit-who-mwh-2017] |
| `U3` | Urgent — before the next dose decision | Before the next scheduled dose of the affected medication (or the next decision to give, hold, or restart it). | The scheduled-dose concept: ISMP's non-time-critical windows tie the decision to the next dose's scheduled time. | [cit-ismp-timely-admin-2011], [cit-cms-sc-12-05-2011] |
| `U4` | Immediate — time-critical | Within the time-critical window of the affected dose: ISMP's definition of medications "where early or delayed administration of maintenance doses of greater than 30 minutes before or after the scheduled dose may cause harm or result in substantial sub-optimal therapy or pharmacological effect". The case clock (D-WF-002) fires authored consequences past the window. | ISMP time-critical definition and the CMS scheduled-medication guidance. Membership of a specific drug in the class is a per-drug rule cited at case authoring (policy §7 correction note). | [cit-ismp-timely-admin-2011], [cit-cms-sc-12-05-2011] |

## 5. Axis 5 — Harm class (three ordinal sub-scales)

Harm class is three independent ordinals (D-SCOR-001): **severity** (how bad), **reversibility**
(whether it undoes), **time-to-harm** (how fast). Authors set each; the scoring engine maps
(urgency, severity) to display tiers (`standard` / `elevated` / `critical`) by lookup, never by
arithmetic (clinical-model appendix §4). No sub-scale carries a probability.

### 5.1 Adaptation statement (mandatory wherever the severity scale is shown)

The severity scale is anchored to the **NCC MERP Index for Categorizing Medication Errors
(revised 2022)**, which indexes the *actual* outcome of an error that has occurred
[cit-nccmerp-index-2022]. medrecsim reads the Index as the **potential worst-credible outcome**
of a discrepancy that reaches the patient uncorrected. This is an adaptation the publisher did
not make; every citation of the Index for a severity ordinal carries the policy's adaptation
note, and the debrief renders "potential" beside every severity label. The potential-harm
stance follows the MARQUIS primary outcome ("potentially harmful unintentional medication
discrepancies") [cit-salanitro-marquis-2013, cit-schnipper-marquis-2018] and the earlier
admission-discrepancy studies that rated discrepancies "for their potential to cause patient
harm" [cit-cornish-2005, cit-gleason-match-2010].

### 5.2 Severity S0–S4 (potential worst-credible outcome)

MERP categories A and B describe circumstances or errors that never reached a patient; a
discrepancy that is present in the record and would act on the patient if uncorrected starts at
C. The Index's own definitions of *harm* ("impairment of the physical, emotional, or
psychological function or structure of the body and/or pain resulting therefrom"),
*monitoring*, *intervention*, and *intervention necessary to sustain life* apply unchanged.

| Token | Label | Potential worst-credible outcome if uncorrected | MERP categories read as potential | Citations |
|---|---|---|---|---|
| `S0` | Negligible | No harm; at most monitoring to confirm no harm resulted. | C–D | [cit-nccmerp-index-2022] |
| `S1` | Minor | Temporary harm requiring intervention (a symptom, a laboratory derangement, a treatment change) that does not extend hospitalization. | E | [cit-nccmerp-index-2022] |
| `S2` | Moderate | Temporary harm requiring initial or prolonged hospitalization. | F | [cit-nccmerp-index-2022] |
| `S3` | Major | Permanent harm, or harm requiring intervention necessary to sustain life. | G–H | [cit-nccmerp-index-2022] |
| `S4` | Catastrophic | Death. | I | [cit-nccmerp-index-2022] |

### 5.3 Reversibility (3 levels)

Whether the worst-credible outcome undoes once the discrepancy is corrected. Anchored to the
MERP distinction between *temporary* harm (E–F) and *permanent* harm or life-sustaining
intervention (G–I) [cit-nccmerp-index-2022].

| Token | Label | Definition | Citations |
|---|---|---|---|
| `self-limiting` | Self-limiting | Resolves once the discrepancy is corrected, with monitoring at most and no treatment of the consequence itself. | [cit-nccmerp-index-2022] (C–D "monitoring") |
| `reversible-with-treatment` | Reversible with treatment | Resolves, but only with intervention or hospitalization directed at the consequence (MERP "temporary harm"). | [cit-nccmerp-index-2022] (E–F) |
| `irreversible` | Irreversible | Permanent harm, an intervention necessary to sustain life, or death. | [cit-nccmerp-index-2022] (G–I) |

Reversibility and severity correlate but are authored independently; at v1 the validator does
not enforce cross-scale consistency (an EP-9 lint may warn on `S3`/`S4` with `self-limiting`).

### 5.4 Time-to-harm (4 levels) and why urgency ≠ time-to-harm

The **physiologic tempo** from the moment the uncorrected discrepancy begins acting on the
patient (a wrong or missed dose, a lapse that continues, a wrong allergy label that changes an
order) to the onset of the worst-credible outcome. Levels 1–2 are anchored to the ISMP
scheduled-medication windows (the only Tier A source that classifies medications by dose-timing
sensitivity); levels 3–4 extend the construct to slower tempos and are anchored by Tier A
exemplars from the v1 roster's drug classes.

| Token | Label | Definition | Anchor | Citations |
|---|---|---|---|---|
| `immediate` | Immediate | Onset within the time-critical window of the first affected dose — minutes to a few hours. | ISMP time-critical definition (harm or substantial sub-optimal effect when a dose is more than 30 minutes early or late). | [cit-ismp-timely-admin-2011], [cit-cms-sc-12-05-2011] |
| `hours-to-a-day` | Hours to a day | Onset across the same day's dosing cycle — beyond the time-critical window but within about a day. | ISMP non-time-critical definition (no harm expected within 1- or 2-hour windows; the daily cycle is the unit) and WHO's 24-hour reconciliation expectation. | [cit-ismp-timely-admin-2011], [cit-who-high5s-sop-2014] |
| `days` | Days | Onset over several days of uncorrected use or lapse. | Exemplar: clozapine labeling changes the safe restart after two or more missed days (a lapse measured in days alters the correct action). Chronic-corticosteroid restart is cited at EP-27. | [cit-dailymed-clozapine-mylan-2026] |
| `weeks-plus` | Weeks or longer | Onset over weeks or longer of uncorrected use or lapse. | Exemplar: antiretroviral interruption, where the consequences named by the NIH guideline (virologic failure, resistance, disease progression) accrue over weeks to months. | [cit-nih-arv-interruption-2022] |

**Urgency is workflow; time-to-harm is physiology.** They often differ, and cases teach the
difference:

- A time-critical schedule (`U4`) usually pairs with `immediate`, but a discrepancy can be
  `U3` (must be settled before the next dose) while its time-to-harm is `days` — the harm comes
  from the *wrong next action*, such as resuming a lapsed agent at the full prior dose.
- A lapse whose harm is `weeks-plus` can still be `U2` because the restart requires an
  escalation that must be started this shift to complete in time.
- An `S4`/`irreversible` discrepancy can be `U1` when nothing in the admission plan touches the
  agent before signature; severity does not set urgency, the plan does.

Authors set the two axes separately; the debrief reveal card shows both with one-line rationale
each (D-PED-002).

## 6. Phenotype mapping (D-TAX-002 → predicates for the coverage matrix)

The coverage matrix (EP-20 `coverage --gate`; release gate G1) tracks the **charter
phenotypes**, not raw enum values. A phenotype row is satisfied when at least one *reviewed*
case contains at least one discrepancy matching the predicate. Predicates are written so the
tool can evaluate them from case metadata plus formulary lookups alone; the appendix's planned
primary/secondary case assignments are planning expectations that the tool's output must
reproduce, not inputs to it.

| # | D-TAX-002 phenotype | Predicate (any discrepancy in a reviewed case) | Notes |
|---|---|---|---|
| P1 | Omission | `type == omission` | |
| P2 | Commission | `type == commission` | |
| P3 | Wrong dose / frequency / formulation | `type in {wrong-dose, wrong-frequency-schedule, wrong-formulation}` | One row per the charter's wording; the tool should also report per-value counts informatively. `wrong-strength-concentration` is counted under P9, not here. |
| P4a | Therapeutic duplication | `type == therapeutic-duplication` | The charter's "therapeutic + brand/generic duplication" requires both sub-rows. |
| P4b | Brand/generic duplication | `type == brand-generic-duplication` | |
| P5 | Look-alike / sound-alike | `type == wrong-drug-lasa OR mechanism == lasa-confusion` | INV-REF-002 additionally requires LASA-partner claims in such cases. |
| P6a | Prescribed-vs-actual mismatch | `mechanism in {cost-access-barrier, supply-interruption, regimen-complexity-misunderstanding, informed-self-adjustment, language-access-barrier}` | The Stratum C family; any type. |
| P6b | …including one affordability/access-driven | `mechanism == cost-access-barrier` | Sub-requirement of P6a. |
| P7 | Restart gap | `type == restart-gap` | |
| P8 | Stale-import error | `mechanism == stale-record-propagation` | Any type. |
| P9 | Unit/concentration error (insulin) | `type == wrong-strength-concentration AND formulary(drug).class == insulin` | The class test resolves through the formulary id (D-DATA-004); the formulary's `highAlert` flag must also be true for the entry (CSR-04). |
| P10 | Allergy-list discrepancy | `type == allergy-record-discrepancy` | |

Mechanical check against the ledger: D-TAX-002 lists ten phenotype clauses (omission;
commission; wrong dose/frequency/formulation; therapeutic + brand/generic duplication;
look-alike/sound-alike; prescribed-vs-actual mismatch incl. one affordability/access-driven;
restart gap; stale-import error; unit/concentration error (insulin); allergy-list discrepancy)
and the table above has ten rows P1–P10 (P4 and P6 split into the sub-rows the clause wording
requires). The high-alert classes (D-TAX-003) and sensitive-content cases (D-CONS-001/002/003)
that gate G1 also covers are **case-level and formulary-level flags**, not discrepancy
metadata, and are out of this document's scope; EP-20 reads them from case and formulary
declarations.

## 7. Divergence and disagreement notes

Every departure from a cited source, with the reason.

### 7.1 `restart-gap` is a pedagogic promotion

The literature folds a lapsed medication into *omission* (the agent is missing from orders) or
treats it as an adherence finding [cit-almanasreh-review-2016, cit-medtax-2019]. medrecsim
promotes it to a type because the **correct action differs**: for agents whose labeling or
guidelines change the safe restart after a lapse, "continue home medication" is the unsafe
action, and the learner must recognise the lapse, not merely the absence. The roster's
phenotype-of-record case (antiretroviral lapse) and its reinforcing cases (chronic
corticosteroid; clozapine) all turn on this distinction [cit-nih-arv-interruption-2022,
cit-dailymed-clozapine-mylan-2026].

### 7.2 Allergy and intolerance records are a first-class type

MedTax carries "allergy or intolerance" as a Level 1 type [cit-imfeld-medtax-2020]; the Joint
Commission goal and the WHO protocol do not address allergy records within reconciliation
(the WHO SOP does not mention allergies at all — verified against the full text 2026-09-02).
medrecsim includes `allergy-record-discrepancy` by decision (D-MED-003) and anchors it to the
federal interoperability data class for allergies and intolerances (substance, reaction)
[cit-onc-uscdi-allergies-2026] and to the 2022 drug-allergy practice parameter for the
clinical significance of inaccurate allergy labels [cit-aaaai-acaai-drug-allergy-2022]. The
allergy sub-task is scored in one or two cases only.

### 7.3 Crosswalk to MedTax (2019) and the 2016 systematic review

MedTax has twelve main types in two levels ("medication mismatched" and "medication partially
matched") and 28 sub-types [cit-medtax-2019]; the main-type names below were verified through
the open-access application paper [cit-imfeld-medtax-2020] because the MedTax full text was
available only at abstract level this session (R-6 note in §10). The 2016 review found that
most studies used empirical classifications (2 to 50 terms), that omission was the most
frequently identified type, and that three prior taxonomies (the Medication Discrepancy Tool,
APS-Doc, and the Belgian unintended-discrepancy taxonomy) were rarely used
[cit-almanasreh-review-2016]; medrecsim's type axis is deliberately closer to MedTax's
attribute-level split than to any of those three.

| medrecsim type | MedTax main type | Relationship |
|---|---|---|
| `omission` | 1.1 Medication omission | Same |
| `commission` | 1.2 Medication commission (or addition) | Same |
| `wrong-dose` | 2.2 Strength / frequency / units / total daily dose | medrecsim splits 2.2 three ways (dose, frequency-schedule, strength-concentration) because each has a different mechanism-of-harm story and a different high-alert profile |
| `wrong-frequency-schedule` | 2.2 and 2.4 Time of administration | Merges MedTax's frequency element with its timing type; time-critical weight moves to the urgency axis |
| `wrong-route` | 2.3 Dosage form / route | medrecsim splits 2.3 into route and formulation |
| `wrong-formulation` | 2.3 Dosage form / route | as above |
| `wrong-strength-concentration` | 2.2 (strength) | Split out for the insulin-concentration phenotype |
| `therapeutic-duplication` | 1.3 Medication duplication | Narrowed to same-class agents |
| `brand-generic-duplication` | 2.1 Name (sub-type "different brand name but same generic name") | Promoted from sub-type to type because it is a charter must-cover phenotype |
| `wrong-drug-lasa` | 2.1 Name | Narrowed to confused-name pairs; other wrong-drug events decompose into commission + omission |
| `restart-gap` | 2.5 Duration or length of therapy / 1.1 | Pedagogic promotion (§7.1) |
| `status-discrepancy` | 2.5 Duration or length of therapy | Reframed around the D-MED-001 claim-status vocabulary |
| `allergy-record-discrepancy` | 1.5 Allergy or intolerance | Same, extended to verification status and prior tolerance (D-MED-003) |
| — | 1.4 Therapeutic class substitution | **Not adopted as a type.** A within-class substitution decomposes into commission + omission with mechanism `prescriber-change-undocumented` (documented substitutions are intentional and not discrepancies) |
| — | 1.6 / 2.6 Other | **Not adopted.** Closed value-set by design; a case needing "other" is a taxonomy change request via the owner |

### 7.4 Mechanism strata versus the intent split

WHO and the review attribute intent to the **prescriber** ("the prescriber has made an
intentional choice … not clearly documented"; "the prescriber unintentionally changed, added
or omitted") [cit-who-high5s-sop-2014, cit-almanasreh-review-2016]. medrecsim keeps that split
as strata A–B and adds strata C–D for causes that sit with access systems, supply, regimen
design, language access, and the limits of what any informant can know — causes the MARQUIS
history-error findings make central [cit-pippins-2008] but the intent split cannot express.
Stratum C is systems-framed by decision (D-CONS-002, D-GOV-004) and is never a judgement of
the patient. Where the literature would call a patient's deliberate adjustment "nonadherence",
medrecsim records `informed-self-adjustment` and treats the record's failure to capture the
choice as the discrepancy.

### 7.5 Detectability is not a published axis

No cited source classifies discrepancies by how they are discoverable. The axis encodes the
multi-source BPMH method that all three Tier A/C process sources prescribe (WHO: several
sources; MARQUIS: at least two; ISMP BP 21: at least one outside resource)
[cit-who-high5s-sop-2014, cit-marquis-bpmh-pocket-2024, cit-ismp-tmsbp-bp21-2026] and the
evidence that artifacts and lists reduce history errors [cit-gleason-match-2010]. It exists so
that the information-seeking subscore has authored sufficiency sets to score against
(D-SCOR-001).

### 7.6 `wrong-route` — keep/drop decision

**Kept** (recommendation adopted; owner ruling "keep" recorded in §11, 2026-09-02). Reasons: the Joint Commission
names route among the medication-information elements [cit-tjc-npg-14-05-01-2026]; MedTax
carries it [cit-imfeld-medtax-2020]; and the migration cost is asymmetric — an unused enum
value costs nothing at v1 (the coverage matrix tracks phenotypes, and no D-TAX-002 phenotype
needs route), whereas adding a value after the EP-9 freeze is a codemod migration
(D-DATA-002). No v1 case is required to use it; the roster closure audit (EP-35) reports it
as "retained, unused" if that remains true.

### 7.7 Joint Commission citation — cite both

Per CITATION-POLICY.md §6 (SP-3; integrator resolution I-14), the type axis cites the
successor goal NPG.14.05.01 (hospital programme, effective 2026-01-01) together with the
archived NPSG.03.06.01; the discrepancy note wording is unchanged between them. Learners may
still meet the old identifier in older material; teaching text names the successor and may
give the archived identifier in parentheses.

### 7.8 NCC MERP — potential, not actual

Stated in §5.1; repeated here because it is a departure from the publisher's intent and must
appear wherever the scale is shown.

### 7.9 Levodopa timing

The urgency anchor is the ISMP/CMS *class* definition, not a levodopa-specific rule; the
planning appendix's attribution of a levodopa best practice to ISMP was corrected at EP-6
(policy §7 correction note). Membership of levodopa in the time-critical class is cited at
EP-28 from a Tier B/C Parkinson source.

## 8. Enum export (EP-9 imports verbatim)

Spelling-frozen at the owner's approval (§11). EP-9 encodes exactly these tokens; the labels
are display strings and may be edited without a migration.

```yaml
# medrecsim discrepancy taxonomy v1.0 — schema source of truth (D-TAX-001; TAXONOMY.md §8)
taxonomyVersion: "1.0"
type:
  - omission
  - commission
  - wrong-dose
  - wrong-frequency-schedule
  - wrong-route
  - wrong-formulation
  - wrong-strength-concentration
  - therapeutic-duplication
  - brand-generic-duplication
  - wrong-drug-lasa
  - restart-gap
  - status-discrepancy
  - allergy-record-discrepancy
mechanism:
  system-record:
    - stale-record-propagation
    - transcription-error
    - lasa-confusion
    - transition-communication-gap
    - data-fragmentation
    - auto-population-default-error
  undocumented-intentional:
    - prescriber-change-undocumented
    - hold-not-documented
  patient-agent-side:
    - cost-access-barrier
    - supply-interruption
    - regimen-complexity-misunderstanding
    - informed-self-adjustment
    - language-access-barrier
  epistemic:
    - informant-knowledge-limit
detectability:
  - single-source-explicit
  - cross-source-conflict
  - interview-elicited
  - artifact-dependent
  - escalation-dependent
  - longitudinal-inference
  - irreducible
urgency: [U1, U2, U3, U4]
severity: [S0, S1, S2, S3, S4]
reversibility: [self-limiting, reversible-with-treatment, irreversible]
timeToHarm: [immediate, hours-to-a-day, days, weeks-plus]
```

Field-name suggestions for EP-9 (not frozen here): `type`, `mechanism` (primary; optional
`secondaryMechanisms[]`), `detectabilityPaths[]`, `urgency`, `severity`, `reversibility`,
`timeToHarm`. The stratum names in the `mechanism` map are documentation groupings; the
schema may flatten them to one enum of fourteen tokens.

## 9. Citation register

Records in the CITATION-POLICY.md §1 shape. Source keys are the §7 pointer-list keys (new keys
added in the same change, mirrored in `source material/REGISTRY.md`). All accessed 2026-09-02
unless noted; access-status notes feed the R-6 log in §10.

```yaml
- id: cit-tjc-npg-14-05-01-2026
  claim: >
    Reconciliation compares the medications the patient brought with those ordered to identify
    and resolve discrepancies, which include omissions, duplications, contraindications, unclear
    information, and changes; medication information includes name, dose, route, frequency,
    and purpose; a good-faith effort to obtain the information meets the intent.
  source: TJC-NPG-HAP-2026
  publisher: The Joint Commission
  title: National Performance Goals, Effective January 2026 for the Hospital Program
  version-or-date: Effective 2026-01-01 (chapter report generated 2025-09-26)
  url: https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82
  accessed: 2026-09-02
  tier: A
  notes: >
    Goal 14, NPG.14.05.01, EP 1 (notes 1–2), EP 2, EP 3 note, EP 5 (pp. 44–45). Successor to
    NPSG.03.06.01 (hospital program, effective 2026-01-01) under Accreditation 360; wording
    unchanged. Archived record: cit-tjc-npsg-03-06-01-2025. Re-verified from the PDF text this
    session.
- id: cit-tjc-npsg-03-06-01-2025
  claim: >
    (Archived wording of the claim above under the pre-2026 identifier.)
  source: TJC-NPSG-HAP-2025
  publisher: The Joint Commission
  title: National Patient Safety Goals, Effective January 2025 for the Hospital Program
  version-or-date: Effective 2025-01-01 (chapter report generated 2024-10-30)
  url: https://digitalassets.jointcommission.org/api/public/content/9be383450fc941df806b76c5fbdd9ae6
  accessed: 2026-09-02
  tier: A
  notes: superseded by cit-tjc-npg-14-05-01-2026 effective 2026-01-01; kept per policy §6.
- id: cit-who-high5s-sop-2014
  claim: >
    A best possible medication history is obtained from a number of different sources,
    interviewing the patient and/or family where possible, and is a snapshot of actual
    medication use even though it may differ from what was prescribed; discrepancies between
    admission orders and the BPMH are undocumented intentional or unintentional; medications
    should be reconciled within 24 hours of the decision to admit.
  source: WHO-HIGH5S-SOP-2014
  publisher: World Health Organization (High 5s project; SOP led by Canada)
  title: "The High 5s Project — Standard Operating Protocol: Assuring Medication Accuracy at Transitions in Care (Medication Reconciliation)"
  version-or-date: Version 3, September 2014 (36 pp.)
  url: https://cdn.who.int/media/docs/default-source/patient-safety/high5s/h5s-sop.pdf
  accessed: 2026-09-02
  tier: A
  notes: >
    Re-verified from the full PDF text this session (the EP-6 pointer row said "re-verify at
    EP-7"): Step 1 BPMH definition (p. 10), "Categories of Discrepancies" (p. 11–12), 24-hour
    reconciliation (p. 11). The document contains no mention of allergies. Dated; pair with
    cit-who-mwh-2017 when cited for current WHO policy.
- id: cit-who-mwh-2017
  claim: >
    WHO names transitions of care, high-risk situations, and polypharmacy as the three priority
    areas of the Global Patient Safety Challenge on medication safety.
  source: WHO-MWH-2017
  publisher: World Health Organization
  title: "Medication Without Harm — WHO Global Patient Safety Challenge"
  version-or-date: Launched 2017-03-29 (web page, undated; accessed date governs)
  url: https://www.who.int/initiatives/medication-without-harm
  accessed: 2026-09-02
  tier: A
  notes: The page's numeric reduction goal is not carried into any medrecsim text.
- id: cit-ismp-high-alert-acute-2024
  claim: >
    Insulin (all formulations, with U-500 emphasis), anticoagulants, opioids, and oral
    sulfonylureas are high-alert medications in acute care; concentration and strength errors
    with insulin are a recognised hazard class.
  source: ISMP-HIGH-ALERT-ACUTE-2024
  publisher: Institute for Safe Medication Practices (ISMP), an affiliate of ECRI
  title: ISMP List of High-Alert Medications in Acute Care Settings
  version-or-date: 2024 (MS5760)
  url: https://online.ecri.org/hubfs/ISMP/Resources/ISMP_HighAlert_AcuteCare_List.pdf
  accessed: 2026-09-02
  tier: A
  notes: Re-fetched this session (public PDF). Hosted by ECRI.
- id: cit-ismp-confused-names-2024
  claim: >
    Look-alike/sound-alike name pairs on the ISMP list, with tall-man lettering, are the
    reference set for wrong-drug and confused-name discrepancies.
  source: ISMP-CONFUSED-NAMES-2024
  publisher: Institute for Safe Medication Practices (ISMP), an affiliate of ECRI
  title: ISMP List of Confused Drug Names
  version-or-date: updated through June 2024
  url: https://online.ecri.org/hubfs/ISMP/Resources/ISMP_ConfusedDrugNames.pdf
  accessed: 2026-09-02
  tier: A
  notes: Not re-fetched this session; EP-6 access (2026-09-02) stands. Pair membership is checked per case at CSR-05.
- id: cit-ismp-tmsbp-bp21-2026
  claim: >
    Medication reconciliation is a three-step process — collect the best possible medication
    history, clarify it with at least one outside resource, and have the prescriber reconcile.
  source: ISMP-TMSBP-HOSP-2026-2027
  publisher: Institute for Safe Medication Practices (ISMP), an affiliate of ECRI
  title: ISMP Targeted Medication Safety Best Practices for Hospitals
  version-or-date: 2026–2027 edition
  url: https://online.ecri.org/hubfs/ISMP/Resources/ISMP_TargetedMedicationSafetyBestPractices_Hospitals.pdf
  accessed: 2026-09-02
  tier: A
  notes: Best Practice 21. Not re-fetched this session; EP-6 access (2026-09-02) stands.
- id: cit-ismp-timely-admin-2011
  claim: >
    Time-critical scheduled medications are those where early or delayed administration of
    maintenance doses of greater than 30 minutes before or after the scheduled dose may cause
    harm or substantial sub-optimal effect; non-time-critical scheduled medications are those
    where administration within 1 hour (more often than daily) or 2 hours (daily, weekly,
    monthly) should not cause harm.
  source: ISMP-TIMELY-ADMIN-2011
  publisher: Institute for Safe Medication Practices (ISMP)
  title: ISMP Acute Care Guidelines for Timely Administration of Scheduled Medications
  version-or-date: 2011
  url: https://www.ismp.org/sites/default/files/attachments/2018-02/tasm.pdf
  accessed: 2026-09-02
  tier: A
  notes: >
    Re-verified from the PDF text this session (Definitions 2–3, Table 1). Class definition
    only; per-drug time-critical membership is a hospital-defined listing (policy §3, §7).
    Parkinson medications are not among the universal examples.
- id: cit-cms-sc-12-05-2011
  claim: >
    Hospitals distinguish time-critical from non-time-critical scheduled medications under the
    medication-administration Condition of Participation.
  source: CMS-SC-12-05-2011
  publisher: Centers for Medicare & Medicaid Services
  title: "S&C-12-05-Hospital: Updated Guidance on Medication Administration, Hospital Appendix A of the State Operations Manual"
  version-or-date: 2011-11-18 (revised 2011-12-02)
  url: https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/downloads/scletter12_05.pdf
  accessed: 2026-09-02
  tier: A
  notes: Not re-fetched this session; EP-6 access (2026-09-02) stands. 42 CFR 482.23(c).
- id: cit-nccmerp-index-2022
  claim: >
    Medication-error outcomes are indexed in categories A–I — no error (A); error, no harm
    (B–D, with D requiring monitoring or intervention to preclude harm); error, harm (E
    temporary harm requiring intervention; F temporary harm requiring initial or prolonged
    hospitalization; G permanent harm; H intervention necessary to sustain life); error, death
    (I) — with harm defined as impairment of physical, emotional, or psychological function or
    structure of the body and/or pain resulting therefrom.
  source: NCCMERP-INDEX-2022
  publisher: National Coordinating Council for Medication Error Reporting and Prevention
  title: NCC MERP Index for Categorizing Medication Errors
  version-or-date: revised 2022 (adopted 1996-07-16; page shows "Revised 07/10/2022"; colour revision announced November 2022)
  url: https://www.nccmerp.org/types-medication-errors
  accessed: 2026-09-02
  tier: A
  notes: >
    adapted — MERP indexes actual outcomes; used here as potential worst-credible outcome.
    Verified from the Index PDF (index-bw-2022.pdf) and the November-2022 revision notice this
    session; the reproduction permission on the PDF covers unmodified text with the copyright
    notice, and no table is reproduced here.
- id: cit-ahrq-psnet-medrec-2024
  claim: >
    Medication reconciliation addresses inadvertent inconsistencies across transitions in care,
    where changes may omit needed medications, duplicate existing therapies, or contain
    incorrect dosages.
  source: AHRQ-PSNET-MEDREC-2024
  publisher: Agency for Healthcare Research and Quality, Patient Safety Network
  title: "Patient Safety Primer: Medication Reconciliation"
  version-or-date: last updated 2024-12-15
  url: https://psnet.ahrq.gov/primer/medication-reconciliation
  accessed: 2026-09-02
  tier: A
  notes: psnet.ahrq.gov was reachable to agent fetch this session (ahrq.gov proper was not).
- id: cit-ahrq-psnet-cpoe-2025
  claim: >
    Order-entry decision support suggests default values for drug doses, routes, and
    frequencies, and order-entry systems generate new types of errors.
  source: AHRQ-PSNET-CPOE-2025
  publisher: Agency for Healthcare Research and Quality, Patient Safety Network
  title: "Patient Safety Primer: Computerized Provider Order Entry"
  version-or-date: last updated 2025-03-15
  url: https://psnet.ahrq.gov/primer/computerized-provider-order-entry
  accessed: 2026-09-02
  tier: A
  notes: Grounds the auto-population/default mechanism; no numbers carried.
- id: cit-ahrq-lep-guide-2012
  claim: >
    Patient-safety systems for patients with limited English proficiency require qualified
    language services; language barriers are a patient-safety condition, not a patient trait.
  source: AHRQ-LEP-GUIDE-2012
  publisher: Agency for Healthcare Research and Quality
  title: "Improving Patient Safety Systems for Patients With Limited English Proficiency: A Guide for Hospitals"
  version-or-date: September 2012 (AHRQ Publication No. 12-0041)
  url: https://psnet.ahrq.gov/issue/improving-patient-safety-systems-patients-limited-english-proficiency-guide-hospitals
  accessed: 2026-09-02
  tier: A
  notes: >
    Verified via the PSNet catalogue entry (title, publisher, date); the full guide on ahrq.gov
    was not opened this session (ahrq.gov blocks agent fetches). Re-verify by hand at EP-26
    (C06) before interpreter-related teaching text cites it.
- id: cit-onc-uscdi-allergies-2026
  claim: >
    The federal interoperability data class "Allergies and Intolerances" is defined as harmful
    or undesired physiological responses associated with exposure to a substance, with data
    elements substance (medication, drug class, non-medication) and reaction.
  source: ONC-USCDI-ALLERGIES
  publisher: Assistant Secretary for Technology Policy / Office of the National Coordinator for Health IT (Interoperability Standards Platform)
  title: "USCDI Data Class: Allergies and Intolerances"
  version-or-date: USCDI v1 through v7 listed (page current at access; the page moved from healthit.gov/isp to isp.healthit.gov)
  url: https://isp.healthit.gov/uscdi-data-class/allergies-and-intolerances
  accessed: 2026-09-02
  tier: A
  notes: The old healthit.gov path returns HTTP 301 to the URL above. Criticality and reaction-severity elements appear in v7 and are not relied on.
- id: cit-fda-drug-shortages-2026
  claim: >
    Drug shortages occur for reasons including manufacturing and quality problems, delays, and
    discontinuations, and can leave a medication unavailable to a patient.
  source: FDA-DRUG-SHORTAGES
  publisher: U.S. Food and Drug Administration
  title: Drug Shortages
  version-or-date: page updated 2026-07-15
  url: https://www.fda.gov/drugs/drug-safety-and-availability/drug-shortages
  accessed: 2026-09-02
  tier: A
  notes: Grounds the supply-interruption mechanism.
- id: cit-cdc-nchs-db333-2019
  claim: >
    Adults report not taking medication as prescribed as a strategy to reduce prescription drug
    costs, most commonly among uninsured adults.
  source: CDC-NCHS-DB333-2019
  publisher: Centers for Disease Control and Prevention, National Center for Health Statistics
  title: "Strategies Used by Adults Aged 18–64 to Reduce Their Prescription Drug Costs, 2017 (NCHS Data Brief No. 333)"
  version-or-date: March 2019
  url: https://www.cdc.gov/nchs/products/databriefs/db333.htm
  accessed: 2026-09-02
  tier: A
  notes: Construct grounding for the cost-access mechanism only; its percentages are not carried into any medrecsim text (D-SCOR-003).
- id: cit-nih-arv-interruption-2022
  claim: >
    Discontinuation or planned interruption of antiretroviral therapy is not recommended
    outside a clinical trial; interruption carries risks including viral rebound, CD4 decline,
    disease progression, and development of drug resistance; an unanticipated short
    interruption of less than one to two days can usually be managed by holding all drugs in
    the regimen.
  source: NIH-ARV-INTERRUPTION-2022
  publisher: National Institutes of Health, Clinicalinfo.HIV.gov (Guidelines for the Use of Antiretroviral Agents in Adults and Adolescents with HIV)
  title: "Discontinuation or Interruption of Antiretroviral Therapy"
  version-or-date: section dated 2022-01-20 (page metadata carries a 2025-09-17 review timestamp)
  url: https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-arv/discontinuation-or-interruption-antiretroviral-therapy
  accessed: 2026-09-02
  tier: A
  notes: >
    Plain agent fetch returned HTTP 403 and the PDF path returned an HTML block page; a fetch
    with a browser user agent returned HTTP 200 and the wording quoted. Tempo exemplar only
    (weeks-plus); EP-30 re-verifies by hand before C09 cites it as a scored rule.
- id: cit-dailymed-clozapine-mylan-2026
  claim: >
    After two missed days of clozapine dosing, treatment resumes at a reduced dosage
    (approximately one quarter of the previous dosage); for longer interruptions treatment
    restarts at 12.5 mg once or twice daily.
  source: DAILYMED-CLOZAPINE-MYLAN-2026
  publisher: U.S. National Library of Medicine, DailyMed (labeler Mylan Pharmaceuticals Inc.)
  title: "CLOZAPINE tablet — prescribing information"
  version-or-date: Revised 4/2026 (SPL published 2026-05-15)
  url: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=883b5d43-0339-7dc1-f775-93791fb9b978
  accessed: 2026-09-02
  tier: A
  notes: >
    Tempo exemplar only (a lapse measured in days changes the correct action). Dosage and
    Administration, re-initiation wording relied on: "resume … at approximately 25% of the
    previous dosage" and "restart … with a dosage of 12.5 mg once or twice daily" (a dose
    fraction, not a probability). Spike SP-1 at EP-32 remains the authority
    for the C11 scored rule and current REMS status.
- id: cit-aaaai-acaai-drug-allergy-2022
  claim: >
    Inaccurate drug-allergy labels have clinical consequences and should be evaluated and, where
    appropriate, removed; allergy history includes the agent, reaction, timing, and subsequent
    tolerance.
  source: AAAAI-ACAAI-DRUG-ALLERGY-2022
  publisher: Joint Task Force on Practice Parameters (AAAAI / ACAAI)
  title: "Drug allergy: A 2022 practice parameter update"
  version-or-date: J Allergy Clin Immunol 2022;150(6):1333–1393
  url: https://doi.org/10.1016/j.jaci.2022.08.028
  accessed: 2026-09-02
  tier: B
  notes: >
    PubMed record verified (PMID 36122788; abstract not available on PubMed); full text not
    opened this session. Re-verify the full text at EP-26 (C06) and EP-31 (C10) before any
    allergy scored rule cites it.
- id: cit-marquis-bpmh-pocket-2024
  claim: >
    The best possible medication history uses at least two sources and covers scheduled, PRN,
    easy-to-forget forms, non-prescription products, last-dose timing, and adherence over the
    past week.
  source: MARQUIS-BPMH-POCKET
  publisher: MARQUIS investigators (AHRQ-funded); Society of Hospital Medicine
  title: "Best Possible Medication History (BPMH) Quick Tips" pocket card
  version-or-date: undated (SHM train-the-trainer materials updated 2024-09)
  url: https://www.leapfroggroup.org/sites/default/files/Files/MARQUIS%20BPMH%20Tri%20Fold%20Pocket%20Guide_1.pdf
  accessed: 2026-09-02
  tier: C
  notes: Not re-fetched this session; EP-6 access (2026-09-02) stands.
- id: cit-medtax-2019
  claim: >
    The medication discrepancy taxonomy (MedTax) comprises twelve main types and 28 sub-types
    of discrepancy with operational definitions, validated by expert Delphi and interrater
    testing.
  source: MEDTAX-2019
  publisher: Elsevier (Research in Social and Administrative Pharmacy)
  title: "The medication discrepancy taxonomy (MedTax): The development and validation of a classification system for medication discrepancies identified through medication reconciliation"
  version-or-date: Res Social Adm Pharm 2020;16(2):142–148 (online 2019-04-14)
  url: https://doi.org/10.1016/j.sapharm.2019.04.005
  accessed: 2026-09-02
  tier: C
  notes: >
    PubMed record and abstract verified (PMID 31015008); full text not opened (subscription).
    Main-type names verified via cit-imfeld-medtax-2020 (open access). Re-verify full text
    before any case cites a MedTax sub-type.
- id: cit-imfeld-medtax-2020
  claim: >
    MedTax Level 1 (medication mismatched) comprises omission, commission (or addition),
    duplication, therapeutic class substitution, allergy or intolerance, other; Level 2
    (medication partially matched) comprises name; strength/frequency/units/total daily dose;
    dosage form/route; time of administration; duration or length of therapy; other.
  source: IMFELD-MEDTAX-2020
  publisher: MDPI (Pharmacy)
  title: "Medication Discrepancies in Community Pharmacies in Switzerland: Identification, Classification, and Their Potential Clinical and Economic Impact"
  version-or-date: Pharmacy 2020;8(1):36 (published 2020-03-09)
  url: https://doi.org/10.3390/pharmacy8010036
  accessed: 2026-09-02
  tier: C
  notes: Open access (PMC7151719); used only as the verified carrier of the MedTax type names, with two MedTax authors among its authors.
- id: cit-almanasreh-review-2016
  claim: >
    Most studies classify discrepancies with empirical schemes of 2 to 50 terms; omission is the
    most frequently identified type; the intentional / undocumented intentional / unintentional
    terminology is inconsistently applied; three prior taxonomies exist and are rarely used.
  source: ALMANASREH-REVIEW-2016
  publisher: Wiley (British Journal of Clinical Pharmacology)
  title: "The medication reconciliation process and classification of discrepancies: a systematic review"
  version-or-date: Br J Clin Pharmacol 2016;82(3):645–658
  url: https://doi.org/10.1111/bcp.13017
  accessed: 2026-09-02
  tier: C
  notes: Open access (PMC5338112); abstract and classification sections verified this session.
- id: cit-cornish-2005
  claim: >
    Unintended discrepancies at admission are common, omission is the most common type, and
    discrepancies can be rated for their potential to cause harm.
  source: CORNISH-2005
  publisher: American Medical Association (Archives of Internal Medicine)
  title: "Unintended medication discrepancies at the time of hospital admission"
  version-or-date: Arch Intern Med 2005;165(4):424–429
  url: https://doi.org/10.1001/archinte.165.4.424
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 15738372). Its percentages are not carried.
- id: cit-pippins-2008
  claim: >
    Potentially harmful unintentional discrepancies arise more often from errors taking the
    preadmission medication history than from reconciling it; low patient understanding of
    preadmission medications is an associated factor.
  source: PIPPINS-2008
  publisher: Springer (Journal of General Internal Medicine)
  title: "Classifying and predicting errors of inpatient medication reconciliation"
  version-or-date: J Gen Intern Med 2008;23(9):1414–1422
  url: https://doi.org/10.1007/s11606-008-0687-9
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 18563493; PMC2518028).
- id: cit-gleason-match-2010
  claim: >
    In the MATCH study most admission order errors originated in medication histories, almost
    half were omissions, errors were rated for potential harm, and presenting a medication list
    or bottles at admission was beneficial.
  source: GLEASON-MATCH-2010
  publisher: Springer (Journal of General Internal Medicine)
  title: "Results of the Medications at Transitions and Clinical Handoffs (MATCH) study: an analysis of medication reconciliation errors and risk factors at hospital admission"
  version-or-date: J Gen Intern Med 2010;25(5):441–447
  url: https://doi.org/10.1007/s11606-010-1256-6
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 20180158; PMC2855002). The AHRQ MATCH toolkit itself (AHRQ-MATCH) was not reachable to agent fetch; re-verify at EP-13 as planned.
- id: cit-salanitro-marquis-2013
  claim: >
    MARQUIS's primary outcome is the number of potentially harmful unintentional medication
    discrepancies per patient, determined against a gold-standard pharmacist medication
    history; most discrepancies are history errors rather than reconciliation errors.
  source: SALANITRO-MARQUIS-2013
  publisher: BMC (BMC Health Services Research)
  title: "Rationale and design of the Multicenter Medication Reconciliation Quality Improvement Study (MARQUIS)"
  version-or-date: BMC Health Serv Res 2013;13:230
  url: https://doi.org/10.1186/1472-6963-13-230
  accessed: 2026-09-02
  tier: C
  notes: Open access (PMC3698100); PubMed record verified (PMID 23800355).
- id: cit-schnipper-marquis-2018
  claim: >
    Mentored implementation of the MARQUIS toolkit reduced total discrepancies; sites that
    installed a new electronic health record during the study saw discrepancies increase.
  source: SCHNIPPER-MARQUIS-2018
  publisher: BMJ (BMJ Quality & Safety)
  title: "Effects of a multifaceted medication reconciliation quality improvement intervention on patient safety: final results of the MARQUIS study"
  version-or-date: BMJ Qual Saf 2018;27(12):954–964
  url: https://doi.org/10.1136/bmjqs-2018-008233
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 30126891).
- id: cit-schnipper-marquis2-2022
  claim: >
    A refined toolkit with system-level and patient-level interventions was associated with a
    decline in unintentional discrepancies across 18 hospitals.
  source: SCHNIPPER-MARQUIS2-2022
  publisher: BMJ (BMJ Quality & Safety)
  title: "Effects of a refined evidence-based toolkit and mentored implementation on medication reconciliation at 18 hospitals: results of the MARQUIS2 study"
  version-or-date: BMJ Qual Saf 2022;31(4):278–286 (online 2021-04-29)
  url: https://doi.org/10.1136/bmjqs-2020-012709
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 33927025; PMC10964422).
- id: cit-mueller-review-2012
  claim: >
    Hospital medication-reconciliation interventions consistently reduce discrepancies and
    potential adverse drug events; successful interventions involve pharmacy staff intensively
    and target high-risk patients.
  source: MUELLER-REVIEW-2012
  publisher: American Medical Association (Archives of Internal Medicine)
  title: "Hospital-based medication reconciliation practices: a systematic review"
  version-or-date: Arch Intern Med 2012;172(14):1057–1069
  url: https://doi.org/10.1001/archinternmed.2012.2246
  accessed: 2026-09-02
  tier: C
  notes: PubMed record and abstract verified (PMID 22733210; PMC3575731).
```

## 10. Source-access log (risk R-6) and change log

| Source | Access outcome 2026-09-02 | Treatment |
|---|---|---|
| WHO High 5s SOP | **Re-verified** from the full PDF (v3, September 2014, 36 pp.) at the cdn.who.int URL now recorded; the EP-6 pointer row's "re-verify at EP-7" is discharged. | Registry and policy rows updated with URL and access date. |
| Joint Commission NPG chapter (PDF) | Re-verified from the PDF text (NPG.14.05.01 EP 1–5, pp. 44–45). | — |
| NCC MERP Index | Verified from the Index PDF and the November-2022 revision notice; the HTML page itself carries only links. | Cited to the landing page with the PDF named in `notes`. |
| ISMP timely-administration guidelines | Verified from the PDF text (legacy ismp.org path still served). | — |
| ISMP high-alert list | Re-fetched (public PDF at ECRI). | — |
| AHRQ MATCH toolkit | ahrq.gov still returns HTTP 403 to agent fetch. | Not cited directly; the MATCH study report [cit-gleason-match-2010] carries the construct. Re-verify by hand at EP-13 as already planned. |
| AHRQ LEP guide | PSNet catalogue entry verified; guide body not opened. | Cited at catalogue level; hand re-verify at EP-26. |
| NIH ARV guideline section | Plain fetch HTTP 403; PDF path served an HTML block page; browser-user-agent fetch HTTP 200. | Cited with the wording obtained; hand re-verify at EP-30. |
| DailyMed clozapine label | DailyMed search UI returned no results to agent fetch; the DailyMed REST API resolved the set id and the label page opened. | Cited by set id. |
| ASHP statement on the pharmacist's role in medication reconciliation | Both ashp.org URLs served an HTML shell instead of the PDF. | Not cited. |
| eCFR 45 CFR 92.201 (language access) | Redirected to a bot-block page. | Not cited; the AHRQ LEP guide anchors the mechanism. |
| MedTax full text; AAAAI/ACAAI parameter full text | Subscription; PubMed records verified. | Cited at record level with re-verify notes. |
| ECRI-hosted ISMP downloads | Still public on 2026-09-02. | Policy §5 ready if gating appears. |

| Date | Change |
|---|---|
| 2026-09-02 | v1.0 drafted (EP-7). Value-sets, ordinals, phenotype predicates, divergence notes, citation register (30 records; 20 new source keys added to CITATION-POLICY.md §7 and the registry). |
| 2026-09-02 | v1.0 owner-approved as written; `wrong-route` kept (§11). |

## 11. Owner approval record (D-EXEC-003 checkpoint)

The value-sets, ordinal anchors, and the `wrong-route` keep decision shape scoring semantics
and are owner-approved before EP-9 freezes them as schema enums. This section is filled by the
owner's ruling at the end of the EP-7 session and mirrored in `docs/handoffs/EP-7.md`.

| Item | Ruling | Date |
|---|---|---|
| Type axis (13 values, §1) | Approved as written | 2026-09-02 |
| Mechanism axis (14 values, §2) | Approved as written | 2026-09-02 |
| Detectability axis (7 values, §3) | Approved as written | 2026-09-02 |
| Urgency U1–U4 (§4) | Approved as written | 2026-09-02 |
| Harm ordinals S0–S4, reversibility, time-to-harm (§5) | Approved as written | 2026-09-02 |
| `wrong-route` keep/drop (§7.6) | Keep | 2026-09-02 |

Rulings were presented interactively as three questions (approval; wrong-route; commit) and
recorded in `docs/handoffs/EP-7.md`. Post-freeze changes follow D-DATA-002.
