# Stigma-safety checklist (D-GOV-004, D-CONS-002, D-CASE-002)

**Instrument version:** 1.0 · **Date:** 2026-09-02 · **Instantiated by:** EP-6 from
[roadmap/appendices/clinical-model.md](../../roadmap/appendices/clinical-model.md) §6 ·
**Executed by:** the project owner as the single reviewer (the project's review model is
**physician-reviewed (single reviewer)**; lived-experience review is a named upgrade trigger
before any patient-perspective claim or feature, D-GOV-004) · **Executed on:** every case
bundle after the clinical self-review and before the public review record; the whole roster at
EP-35 (item 6); at every re-review trigger · **Changes:** owner-only; version bump logged in §12.

This checklist is the third gate of the content lifecycle (D-GOV-001). It reviews every
learner-visible word in a bundle — pre-brief, patient and informant dialogue, NPC (nurse,
pharmacist, senior, office staff) dialogue, artifact text, chart notes, hints, reveal cards,
teaching notes — for stigmatizing language and framing. Sources (all in the citation policy
pointer list): NIDA *Words Matter* (Tier A), APA *Bias-Free Language* (Tier B), AMA Manual of
Style §11.12 Inclusive Language (Tier B). Checks resolve to **pass**, **fail**, or **n/a
(reason)**; a fail blocks publication until reworded. Record findings by check id (`SS-02.1`).

**Working method.** Read the bundle's text as the learner will meet it, in play order. Run the
banned-terms grep (§2) mechanically first, then read for framing (§3–§9), which no grep catches.
Chart notes written *in the voice of a fictional clinician* may realistically contain imperfect
language only when the case is *teaching* that the note is unreliable and the debrief names the
problem; otherwise fictional clinicians write as the guidance recommends. Patients and
informants speak naturally and may use any word about themselves; the *narrative frame, NPC
voice, and teaching voice* are what this checklist governs.

## 1. Person-first language throughout

- **SS-01.1** Teaching, NPC, and chart voices place the person before the condition or
  circumstance: "a patient with diabetes", "a person with opioid use disorder", "a patient who
  uses a wheelchair", "a person experiencing homelessness" — never "a diabetic", "an addict",
  "the wheelchair-bound", "the homeless" (NIDA Words Matter; APA general principles;
  AMA §11.12). Identity-first phrasing is used only where the guidance recognizes a community
  preference and the case has a reason to.
- **SS-01.2** Medication-assisted framing follows NIDA: "medication for opioid use disorder",
  "methadone treatment", not "replacement", "substitution", or "getting high".
- **SS-01.3** Age, disability, language, and socioeconomic references follow APA bias-free
  guidance: specific and relevant ("a 78-year-old patient", "a Spanish-preferring patient"),
  never generic-pejorative ("the elderly", "a non-English speaker", "low-income patient" as a
  character trait).

## 2. Banned terms absent

- **SS-02.1** None of the following appears in narrative, NPC, hint, reveal, or teaching text:
  **clean** / **dirty** (of tests, people, or habits); **non-compliant** / **noncompliant** /
  **non-adherent-as-judgement**; **denies** (of a patient's report; use "reports no…", "says
  they do not…"); **addict**, **abuser**, **user**, **junkie**, **alcoholic** (as a noun for a
  person); **habit**; **drug-seeking**; **frequent flyer**; **failed** (of a patient, a
  medication trial framed as the patient's failure); **refuses** where "declines" is meant;
  **claims** / **admits** / **insists** as reporting verbs that impute dishonesty.
- **SS-02.2** The mechanical screen has been run over every text field of the bundle
  (case-insensitive; word boundaries) and every hit is either removed or, if it sits in a
  fictional record the case deliberately teaches as unreliable, listed in the review record
  with the debrief text that names it.
- **SS-02.3** "Adherence" is used as a neutral description of what happened, never as a verdict
  on the person: "took glimepiride every other day to stretch the supply" not "non-adherent".

## 3. Recurrence framed as recurrence, never relapse-as-moral-failure

- **SS-03.1** Return to substance use, missed treatment, or a treatment gap is described as
  a recurrence or an interruption with its systems cause, never as a lapse of will, a "fall",
  or a "failure" (NIDA). "Relapse" appears, if at all, only inside a quoted clinical instrument
  name.
- **SS-03.2** A treatment gap (methadone, ART, clozapine) is narrated with what interrupted it
  (pharmacy transfer, prior authorization, REMS snag, travel, cost), and the teaching note
  addresses the gap's *clinical* consequence, not the person's reliability.

## 4. Systems framing verified for every adherence or access discrepancy

- **SS-04.1** Every discrepancy whose causal mechanism is patient- or agent-side
  (`cost-access-barrier`, `supply-interruption`, `regimen-complexity-misunderstanding`,
  `informed-self-adjustment`, `language-access-barrier`) has an authored systems cause in the
  evidence layer that the learner can discover, and the reveal card names the system, not the
  patient, as the point of intervention (D-CONS-002; D-GOV-004).
- **SS-04.2** `informed-self-adjustment` is framed as a decision the patient made with reasons
  (side effects, cost, understanding of purpose) that the learner is expected to elicit and
  respect; the scored-correct response is clarification and shared planning, never
  "counsel the patient to comply".
- **SS-04.3** Cost or access mechanisms point to a modeled resource (pharmacist
  assistance-program referral, social work, prescriber office) so the debrief teaches an
  action, not a shrug.

## 5. No diagnosis-as-identity; characters have non-clinical texture

- **SS-05.1** No character is introduced or referred to by a diagnosis, a substance, a
  disability, or an insurance status as their identity ("the HIV patient", "the Parkinson's in
  bed 4", "the Medicaid patient").
- **SS-05.2** Every patient and informant has at least two authored non-clinical details
  (work, family role, interests, routines, how they organize their medications) that appear in
  dialogue or artifacts and are not plot devices for a discrepancy.
- **SS-05.3** Occupation, housing, family structure, and language are plausible and specific,
  not stereotype shorthand; where a detail is unnecessary to the case it is omitted rather than
  defaulted.

## 6. Aggregate demographic-stereotype audit (roster level; executed at EP-35)

- **SS-06.1** *Per case:* the case's demographic assignment (age, sex, language, race or
  ethnicity where stated, socioeconomic markers, substance use, psychiatric diagnosis, HIV
  status) is recorded in the review record so the roster audit can tabulate it.
- **SS-06.2** *Per case:* no sensitive content (OUD, psychiatric medication, HIV, impaired
  capacity, non-English preference, cost barriers) is co-located with a demographic marker in
  a way that reproduces a known stereotype, unless the case documents why and the roster shows
  the same marker elsewhere without that content.
- **SS-06.3** *Roster (EP-35):* tabulate SS-06.1 across all eleven cases and confirm (a) no
  demographic group carries a disproportionate share of the sensitive-content cases, (b)
  record-is-wrong cases (D-CASE-002) are distributed across demographics, (c) reliable and
  unreliable historians are not sorted by age, language, or socioeconomic marker, and (d) the
  interpreter case and the surrogate case do not stack additional adversity markers. Findings
  and any reassignments are recorded in the roster-closure record.

## 7. Elder, surrogate, and interpreter-mediated patients retain agency

- **SS-07.1** Older patients are not written as confused by default; where capacity is impaired
  it is authored fact with an authorized surrogate whose authorization is explicit in-case
  (D-CONS-001), and the patient is still addressed and described as a person, not a chart.
- **SS-07.2** The surrogate is a knowledgeable partner whose information is weighed on its
  merits (often correct, D-CASE-002), not a proxy the learner "gets the history from" while the
  patient is scenery.
- **SS-07.3** In the interpreter case (D-CONS-002) the professional interpreter is the
  modeled-correct path; the grandson's ad-hoc interpretation is modeled *lower-reliability*
  because of the channel, never because of the family's competence or motives; the patient's
  own words (interpreted) are the authoritative account of her regimen and preferences.
- **SS-07.4** Decisions that are the patient's or surrogate's to make are not narrated as
  things done to them.

## 8. Patient-credibility tone

- **SS-08.1** Patients and caregivers are treated as credible sources by default; the case
  never rewards disbelieving a patient because of who they are. Where the patient is wrong, the
  evidence layer shows *why* (a misunderstanding, a stale label, a memory limit) and the
  debrief frames it as an information problem.
- **SS-08.2** In the record-is-wrong cases (C01, C06, C09, C10) the reveal card states plainly
  that the patient or caregiver was correct and the electronic source was not; the learner path
  that trusted the record over the person is debriefed without mocking the learner.
- **SS-08.3** Reporting verbs are neutral ("reports", "says", "describes", "recalls"); see
  SS-02.1 for the banned set.

## 9. No clinician-cynicism tropes in NPC dialogue

- **SS-09.1** Nurse, pharmacist, senior/attending, office-staff, and pharmacy NPCs speak as
  competent, collegial professionals; none is written as an obstacle, a burnout caricature, a
  gatekeeper, or a source of sarcasm about patients, other services, or the learner.
- **SS-09.2** Realistic friction (an office closed overnight; a pharmacy on hold; an attending
  who wants the question framed) is systems friction with a professional voice, never contempt.
- **SS-09.3** No NPC line expresses or implies judgement about a patient's substance use,
  psychiatric diagnosis, HIV status, language, housing, weight, or insurance.

## 10. No patient-experience claims (D-GOV-004)

- **SS-10.1** No text states or implies what patients in general feel, want, or experience
  ("patients often feel…", "people with OUD are…"); patient dialogue is *this fictional
  patient's* words, and teaching notes speak about medication safety and systems, not about
  patient experience.
- **SS-10.2** The pre-brief's sensitive-content note (I-17) is brief, neutral, and specific to
  the case's content; it does not editorialize or offer the learner a lesson about the group.
- **SS-10.3** No text claims that the case was reviewed by, informed by, or representative of
  people with lived experience; the review model disclosed is physician-reviewed (single
  reviewer), and lived-experience review remains a named upgrade trigger.

## 11. Sign-off block

Same fields as the clinical self-review checklist §12; the two blocks are recorded together in
the bundle's `review-record.yaml` (see [REVIEW-RECORD-TEMPLATE.md](REVIEW-RECORD-TEMPLATE.md)).
Add to `findings` the SS-06.1 demographic-assignment line so EP-35 can tabulate it.

| Field | Value |
|---|---|
| Reviewer · Credential · Review model | project owner · physician · physician-reviewed (single reviewer) |
| Review date | ISO date |
| Checklist version used | stigma-safety 1.0 |
| Content version reviewed | bundle `contentVersion` + `schemaVersion` |
| Banned-terms screen | run (date) — hits: none / listed |
| Demographic assignment (SS-06.1) | one line |
| Findings | check ids with pass / fail / n/a and notes |
| Disposition | `approved` · `approved-with-changes` · `returned` |

## 12. Instrument log

| Date | Version | Change |
|---|---|---|
| 2026-09-02 | 1.0 | Instantiated (EP-6). Eleven items, 30 checks; banned-terms set enumerated for a mechanical screen; roster-level item 6 split into per-case recording and the EP-35 tabulation. |
