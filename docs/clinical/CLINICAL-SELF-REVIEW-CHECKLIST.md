# Clinical self-review checklist (D-CLIN-001, D-GOV-001)

**Instrument version:** 1.0 · **Date:** 2026-09-02 · **Instantiated by:** EP-6 from
[roadmap/appendices/clinical-model.md](../../roadmap/appendices/clinical-model.md) §5 ·
**Executed by:** the project owner, a physician, as the single reviewer — the review model this
project discloses everywhere as **physician-reviewed (single reviewer)** · **Executed on:** every
case bundle before first publication (EP-14 and each case EP), every formulary wave (EP-13,
EP-33), and at every re-review trigger (annual; issue report; schema migration touching clinical
semantics) · **Changes to this instrument:** owner-only; each change bumps the version and is
logged in §13.

This checklist is the second gate of the content lifecycle (D-GOV-001): draft → automated
validation → **this checklist** → stigma-safety checklist → public review record → publish. It
is a *structured self-review* derived from ISMP and AHRQ sources (D-CLIN-001); it does not
substitute for the independent pharmacist or medication-safety dual review that remains a named
upgrade trigger. Its output is the sign-off block in §12, which becomes the public review record
(template: [REVIEW-RECORD-TEMPLATE.md](REVIEW-RECORD-TEMPLATE.md)).

**How to run it.** Work through the twelve sections in order with the bundle's `reference.yaml`,
`evidence.yaml`, `citations.yaml`, teaching notes, and the validator output open. Every check
resolves to **pass**, **fail**, or **n/a (reason)**; a fail blocks publication until fixed or
until the item is authored as a "discussion item — not scored" (D-RISK-004). Record findings by
check id (`CSR-04.2`) in the review record. Automated invariants (INV-*) are cited where the
validator already covers part of a check; the reviewer still confirms the *clinical* judgement
the validator cannot make.

## 1. Truth-layer consistency (D-MED-005, D-MED-002)

- **CSR-01.1** Every reference-regimen entry and every actual-use-state entry is either
  supported by at least one evidence-layer claim, marked `conditionally-discoverable` with a
  real path, or marked `irreducibly-uncertain`. No reference fact is silently unreachable.
  (INV-DISC-003, INV-TRUTH-001)
- **CSR-01.2** Every evidence-layer claim traces to a reference fact, an authored red herring,
  or an authored source error; no claim exists that the reference layer cannot explain.
- **CSR-01.3** Dual timestamps are coherent: no documentation time precedes its event time; no
  post-T0 inpatient action rewrites pre-admission state. (INV-TIME-*)
- **CSR-01.4** Irreducible items preserve their uncertainty end to end: the accepted set
  admits "unable to verify" or "deferred, with follow-up plan", the debrief reveal card says why
  the item is irreducible, and no hint tier reveals a fact the reference layer marks unknowable.

## 2. Clinical plausibility of the whole scenario

- **CSR-02.1** The admission diagnosis, comorbidities, regimen, doses, formulations, and
  frequencies are internally consistent and plausible for an adult general-medicine admission
  from the ED (D-PROD-004); doses fall within labeled or guideline ranges unless the deviation
  *is* the authored discrepancy.
- **CSR-02.2** Every authored discrepancy has a plausible causal story that a clinician would
  recognize; none depends on a coincidence the learner could not reasonably infer.
- **CSR-02.3** Source behaviour is realistic: the imported list is stale in the way imports are
  stale; pharmacy dispensing history reflects fills, not intent; the outpatient note reads like
  a note; informants know what such informants know (D-WF-001).
- **CSR-02.4** Nothing in the case depends on a real institution, product trade dress, or
  branded drug name (D-DATA-001; INV-SCOPE-001); fictional brand labels are drawn from the
  formulary's fictional set.

## 3. BPMH-process fidelity (MARQUIS BPMH domains; ISMP Best Practice 21)

- **CSR-03.1** Every key reference fact (each medication's identity, dose, frequency, and
  actual-use status that the case scores) is corroborated by **≥2 evidence sources**, or the
  case authors the single-source situation deliberately and the accepted set admits
  verification-pending outcomes.
- **CSR-03.2** The interview question menus represent the MARQUIS BPMH domains: an open-ended
  opener ("what medications do you take at home?"); scheduled and PRN medications; purpose of
  each medication; condition-specific prompts; medications from subspecialists;
  easy-to-forget forms (inhalers, nebulizers, sprays, ointments, eye and ear drops, patches,
  injections, suppositories); evening, weekly, and monthly doses; non-prescription products
  (OTC, vitamins, herbals, minerals); recent use and last-dose timing; adherence asked without
  judgement ("in the last week, how many days have you missed…"). Domains a case deliberately
  omits are listed in the record with the reason.
- **CSR-03.3** Allergies and reactions are elicited as part of the history (ISMP Best Practice
  21 c.i.c; D-MED-003), including prior tolerance where an allergy sub-task exists.
- **CSR-03.4** At least one *outside* resource (community pharmacy, prescriber office, clinic
  note) is available for clarification and its use is modeled in the accepted paths
  (Best Practice 21 c.ii).
- **CSR-03.5** The "read the list aloud" anti-pattern is not the rewarded path; the
  information-seeking subscore favours elicitation over confirmation (§4 of the clinical-model
  scoring spec).

## 4. High-alert audit (ISMP high-alert list, current edition; ISMP Targeted Best Practices)

- **CSR-04.1** Every medication in the bundle is checked against the **current** ISMP List of
  High-Alert Medications in Acute Care Settings (edition and access date recorded in the
  citation); every match carries the formulary `highAlert` flag with that citation. Classes to
  watch in the v1 roster: anticoagulants (including DOACs), all insulins (U-500 special
  emphasis), opioids by all routes (methadone), oral sulfonylureas, chronic oral methotrexate.
- **CSR-04.2** **Anticoagulant escalation-only rule** (D-TAX-003): any periprocedural hold,
  bridge, or restart plan appears only as an escalation target or as an *unsafe* learner
  action; no accepted entry lets the learner author a bridging plan. Cites NPG.14.04.01
  (perioperative management by approved protocol) and its archived NPSG.03.05.01.
- **CSR-04.3** **U-500 insulin** (C10): the concentration/unit hazard is authored with
  distinct strategies, pharmacist consultation is in the expected-escalation set, and teaching
  text names the special-emphasis status (ISMP list) and the targeted-education expectation
  (Best Practice 19 g).
- **CSR-04.4** **Time-critical medications** (C07 levodopa; any other): the case applies the
  ISMP/CMS time-critical definition (harm or sub-therapeutic effect if given more than 30
  minutes early or late; goal within 30 minutes before or after) as the clock rule, cites the
  definition (`ISMP-TIMELY-ADMIN-2011`, `CMS-SC-12-05-2011`) **and** a Tier B/C source for the
  specific drug's sensitivity to delay, and does **not** attribute the drug-specific rule to the
  ISMP Targeted Best Practices (which contain none). The clock event fires deterministically
  (D-WF-002) and the debrief explains it in plausible-consequence language (§9).
- **CSR-04.5** Layered strategies, not vigilance: where the case teaches how a high-alert error
  is prevented, the teaching note reflects Best Practice 19's system framing (bundled
  strategies, limited independent double checks) rather than "be careful".
- **CSR-04.6** Sensitive high-alert content (methadone/OTP, clozapine, ART) has its spike
  (SP-1, SP-2) executed and cited before the accepted/unsafe sets are finalized.

## 5. LASA audit (ISMP List of Confused Drug Names, current edition; tall man letters)

- **CSR-05.1** Every medication in the bundle is checked against the current ISMP List of
  Confused Drug Names; every pair present in the formulary is declared bidirectionally with
  `lasaPartners` and the list citation. (INV-REF-002)
- **CSR-05.2** Where the list gives FDA-approved or ISMP-recommended tall man letters, the
  formulary entry carries the `tallMan` rendering and the UI-facing text uses it consistently
  (chart tabs may show plain text where the fictional EHR realistically would; the
  teaching note shows tall man).
- **CSR-05.3** A LASA-phenotype case (C04) contains claims naming both members of the pair in
  the evidence layer, so the confusion is detectable, and the debrief names the pair.
- **CSR-05.4** No fictional brand name introduced by the formulary creates a *new* LASA pair
  with a real generic or another fictional brand (screen with the list and by eye).

## 6. Discrepancy-metadata audit (D-TAX-001; taxonomy v1)

- **CSR-06.1** Every discrepancy carries all five axes (type, causal mechanism, detectability,
  urgency, harm class with severity / reversibility / time-to-harm) using taxonomy v1 values
  only. (INV-DISC-001)
- **CSR-06.2** Every declared detectability path is real: the named sources, dialogue nodes,
  artifacts, or escalations exist and are reachable before signature. (INV-DISC-002)
- **CSR-06.3** Ordinals are defensible and consistent across the roster: urgency reflects
  workflow priority (next dose decision), time-to-harm reflects physiologic tempo, and the two
  are not conflated; severity is stated as *potential worst-credible outcome* against the
  NCC MERP anchor with the adaptation note. Comparable discrepancies in other reviewed cases
  carry comparable ordinals; differences are explainable.
- **CSR-06.4** `irreducible` detectability is used only where the reference layer marks the
  fact `irreducibly-uncertain`, and every such item's accepted set includes "unable to verify"
  or "deferred, with follow-up plan". (INV-DISC-003)
- **CSR-06.5** Coverage declarations match the case's actual phenotype content (INV-META-001)
  and the roster coverage matrix still has ≥1 primary case per must-cover phenotype.

## 7. Accepted / unsafe action-set audit (D-SCOR-002, D-MED-005)

- **CSR-07.1** The **full action space is classified**: every scoreable action resolves to
  accepted, partially-accepted, unsafe, or the case's declared default band for unlisted
  actions. (INV-ACT-001)
- **CSR-07.2** Every entry has a rationale from the authored rationale menu; every unsafe entry
  has a `mechanismOfHarm` with its own citation where the mechanism is not the same rule.
- **CSR-07.3** **No unsafe action is reachable through an accepted rationale**: for each
  accepted rationale, enumerate the actions it could justify and confirm none is in the unsafe
  set; for each unsafe action, confirm no accepted rationale text would plausibly lead a
  learner to it.
- **CSR-07.4** The winnability proof holds: at least one action sequence signs entirely within
  accepted sets (INV-ACT-002 or the golden full-credit script), and that sequence is one a
  competent PGY-1 could find without hints.
- **CSR-07.5** Contested or judgement-heavy items are either authored as accepted alternatives
  (multiple defensible answers) or explicitly marked "discussion item — not scored"; nothing
  contestable is scored as a single hidden answer.
- **CSR-07.6** Unnecessary escalation and thoroughness are never penalized anywhere in the
  sets (safety-culture rule).

## 8. Escalation realism (D-CLIN-002; OQ-3 channel labels)

- **CSR-08.1** Each of the four channels present (community pharmacy; outpatient
  prescriber/program office; inpatient pharmacist; senior/attending) has an authored
  availability window, latency, and response content that a clinician would recognize as
  realistic for the fictional setting and the case's simulated clock (e.g. an OTP that opens at
  06:00; an outpatient office closed overnight; pharmacy phone latency).
- **CSR-08.2** Latencies are answerable within the case timeline (INV-TIME-003), and a
  required escalation whose answer cannot arrive before signature is authored as
  "deferred, with follow-up plan" being the scored-correct terminal state (D-WF-004).
- **CSR-08.3** Regulatory content in responses (OTP dose verification, REMS status, interpreter
  requirements) cites its Tier A source and matches the executed spike.
- **CSR-08.4** NPC responses are professionally realistic and free of clinician-cynicism
  tropes (cross-check with the stigma-safety checklist SS-09).

## 9. Harm-language audit (D-SCOR-003)

The rule this section enforces, quoted from DECISIONS.md:

> **D-SCOR-003** — Harm-language rule: plausible-consequence phrasing with ordinal severity;
> inevitable-harm claims only where authored as such; no fabricated statistics; any numbers
> come from cited teaching notes.

- **CSR-09.1** Every mechanism-of-harm text, reveal card, and teaching note uses
  plausible-consequence phrasing ("can lead to", "risks", "may result in") paired with the
  ordinal severity label; it never asserts that harm *will* occur unless the item carries the
  `inevitabilityAuthored` flag with a citation that supports inevitability.
- **CSR-09.2** No probabilities, percentages, odds, relative risks, or "most patients" /
  "rarely" quantifiers appear anywhere in teaching text unless the exact figure is quoted from
  a cited Tier A/B source and the citation id sits on the same span. (INV-ACT-001 lint:
  probability-token denylist; numbers require a citation ref.)
- **CSR-09.3** Severity, reversibility, and time-to-harm are shown as ordinal labels, never
  as scores, points, or percentages; the NCC MERP adaptation statement accompanies the
  severity scale wherever it is presented.
- **CSR-09.4** Harm language addresses the medication and the system, never the patient's
  character (cross-check SS-04, SS-08).

## 10. Citation completeness (D-GOV-002; CITATION-POLICY.md)

- **CSR-10.1** Every scored clinical rule (as defined in the citation policy) references ≥1
  citation record with `tier: A` or `tier: B`; every record has all ten keys populated with a
  real `version-or-date` and an ISO `accessed` date within the last twelve months.
  (INV-CIT-001)
- **CSR-10.2** The reviewer has **opened** each cited source on the review date, or within the
  review window, and the wording relied on matches the `notes` quotation; sources that moved,
  renumbered, or became login-gated are handled per policy §5–6 and logged in policy §8.
- **CSR-10.3** Tier D records support no rule alone; Tier C records support constructs, not
  drug-specific rules.
- **CSR-10.4** Adaptation statements (NCC MERP; time-critical definition; MARQUIS/MATCH
  constructs) are present where the policy requires them.
- **CSR-10.5** Every source key used has a pointer row in `source material/REGISTRY.md`.

## 11. Scope and claims audit (D-QA-002; docs/CLAIMS.md)

- **CSR-11.1** Nothing in the case, its pre-brief, or its teaching notes implies a capability
  the project does not claim. The review is never described as "expert-reviewed", "peer-reviewed", "validated", or "pharmacist-reviewed" (docs/CLAIMS.md C3);
  there is no clinical-decision-support framing, no patient-experience claim (D-GOV-004), and
  no suggestion that the simulation reflects any real institution's practice.
- **CSR-11.2** The review descriptor used anywhere in the bundle is exactly
  **physician-reviewed (single reviewer)**, and the pre-brief consumes the standing
  disclaimer block from `docs/CLAIMS.md` unmodified.
- **CSR-11.3** Numbers about the project (case counts, coverage) are live values, not targets
  stated as achievements (C9).
- **CSR-11.4** Content stays within the frozen v1 scope (D-RISK-002): no free-text learner
  input, no runtime LLM, no order entry beyond bounded "flag & escalate / propose with
  rationale" (D-PROD-002). Any new idea surfaced during review is parked in
  `roadmap/final-roadmap.md`, not authored.

## 12. Sign-off block → public review record (D-RISK-003)

Complete this block only when every check above is **pass** or **n/a**, or every fail has been
converted into a "discussion item — not scored" with its dispute recorded in the case changelog.
The block is copied into the bundle's `review-record.yaml` per
[REVIEW-RECORD-TEMPLATE.md](REVIEW-RECORD-TEMPLATE.md); the template's badge fields render in the
pre-brief as **physician-reviewed (single reviewer)** with the record version and date.

| Field | Value |
|---|---|
| Reviewer | project owner |
| Credential | physician (stated as the owner chooses to state it publicly; never an employer or institution) |
| Review model | physician-reviewed (single reviewer) |
| Review date | ISO date |
| Checklist versions used | clinical self-review 1.0; stigma-safety (version) |
| Content version reviewed | bundle `contentVersion` + `schemaVersion` |
| Sources verified | list of citation ids opened on the review date |
| Findings | check ids with pass / fail / n/a and one-line notes |
| Disposition | `approved` · `approved-with-changes` (changes listed, re-run of affected sections recorded) · `returned` (not publishable) · `frozen-items` (published with named items marked "discussion item — not scored") |
| Re-review due | review date + 12 months, or earlier trigger |

## 13. Instrument log

| Date | Version | Change |
|---|---|---|
| 2026-09-02 | 1.0 | Instantiated (EP-6). Twelve sections, 51 checks. §4.4 written against the verified sources (time-critical definition from ISMP 2011 / CMS S&C-12-05; no levodopa best practice exists in ISMP TMSBP 2026–2027). |
