# Citation policy and approved-source tiers (D-GOV-002)

**Instrument version:** 1.0 · **Date:** 2026-09-02 · **Instantiated by:** EP-6 from
[roadmap/appendices/clinical-model.md](../../roadmap/appendices/clinical-model.md) §7–8 ·
**Status:** in force for all clinical content from the first formulary wave (EP-13) onward;
enforced by validator invariant INV-CIT-001 at warn level from EP-9 and strictly from EP-20 ·
**Changes:** owner-only for the tiers and the citation rule; access-date refreshes and
source-drift notes may be appended by any session and are logged in §8.

This document fixes three things: the **shape** of a citation record, the **tiers** of approved
sources and the rule that binds scored clinical rules to them, and the **procedures** for sources
that are login-gated, moved, or renumbered. It also records the result of spike SP-3 (Joint
Commission successor wording) and confirms integrator resolution I-14.

Vocabulary used below: a *scored clinical rule* is any reference-layer statement that the engine
scores against or that the debrief teaches as clinical fact — an accepted, partially-accepted, or
unsafe action-set entry and its rationale; an expected escalation; a discrepancy's urgency,
severity, reversibility, or time-to-harm ordinal; a mechanism-of-harm text; a high-alert,
time-critical, or look-alike/sound-alike flag in the formulary; and any teaching note. Case
narrative, dialogue texture, and fictional names are not clinical rules and need no citation.

## 1. The citation record

Every citation is a YAML mapping with exactly these ten keys (order is conventional, not
required). The content schema (EP-9) encodes this shape verbatim; it may add optional keys but
may not remove or rename these.

| Key | Type | Meaning and constraints |
|---|---|---|
| `id` | string | Stable identifier, unique within the bundle: `cit-` + short source slug + year, e.g. `cit-tjc-npg-14-05-01-2026`. Never renumbered; a withdrawn citation keeps its id with `notes: withdrawn <date>: <reason>`. |
| `claim` | string | The single clinical statement this citation supports, in the project's own words. One claim per record; a rule resting on two statements carries two records. |
| `source` | string | Short canonical source key from the pointer list in §7 (e.g. `TJC-NPG-HAP-2026`, `ISMP-HIGH-ALERT-ACUTE-2024`). New keys are added to §7 and to the data/asset registry in the same change. |
| `publisher` | string | Issuing body as it names itself (e.g. `The Joint Commission`, `Institute for Safe Medication Practices (ISMP), an affiliate of ECRI`). |
| `title` | string | Document title as published, including program or setting qualifiers. |
| `version-or-date` | string | The edition, effective date, revision date, or "updated through" date printed on the document. Never blank; use `undated (accessed <date>)` only when the source carries no date at all. |
| `url` | string | Public URL of the document or its bibliographic landing page. For login-gated sources, the public landing page (see §5). |
| `accessed` | date (ISO `YYYY-MM-DD`) | The date the citing session actually opened the source. Refreshed at every re-review; the old date moves to `notes`. |
| `tier` | `A` / `B` / `C` / `D` | Per §2. |
| `notes` | string | Free text: page or section pointers, quotation of the exact wording relied on, transition notes (§6), archived-copy notes (§5), superseded-by pointers, and the "adaptation" statements required by §3. May be empty. |

Example (a real record, used again in §6):

```yaml
- id: cit-tjc-npg-14-05-01-2026
  claim: >
    Reconciliation compares the medications the patient is taking with newly ordered
    medications and addresses omissions, duplications, contraindications, unclear
    information, and changes.
  source: TJC-NPG-HAP-2026
  publisher: The Joint Commission
  title: National Performance Goals, Effective January 2026 for the Hospital Program
  version-or-date: Effective 2026-01-01 (chapter report generated 2025-09-26)
  url: https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82
  accessed: 2026-09-02
  tier: A
  notes: >
    Goal 14, NPG.14.05.01, EP 3 note. Successor to NPSG.03.06.01 (hospital program) under the
    Accreditation 360 reframing; cite both per the transition rule in CITATION-POLICY.md §6.
```

Numbers in teaching text follow D-SCOR-003: a numeric statement is itself a claim and needs its
own record whose `notes` quotes the figure as printed in the source.

## 2. Approved-source tiers

| Tier | Definition | Named examples (not exhaustive; additions are owner decisions) |
|---|---|---|
| **A** | Regulatory bodies and national medication-safety or public-health authorities. | FDA and DailyMed labeling; ISMP (an ECRI affiliate) lists and best practices; The Joint Commission (NPSG chapters and their NPG successors); WHO; AHRQ (including PSNet and the MATCH toolkit); NCC MERP; CDC and NIH (including clinicalinfo.hiv.gov and NIDA); SAMHSA (including 42 CFR Part 8 as published); CMS Conditions of Participation and survey-and-certification guidance. |
| **B** | Professional-society clinical guidelines and consensus statements. | ADA Standards of Care; ACC/AHA and CHEST guidelines; ASHP guidelines and statements; AGS Beers Criteria; APA practice guidelines and style/bias-free language guidance; the AMA Manual of Style inclusive-language section. |
| **C** | Peer-reviewed literature. | Taxonomy and construct grounding (MedTax, Almanasreh et al.), MARQUIS and MATCH primary reports, delayed-dose harm literature. Tier C supports **constructs** (why an axis or phenotype exists) and may corroborate a rule, but never carries a scored rule alone. |
| **D** | Tertiary summaries: drug-information compendia, review sites, textbooks, vendor monographs, encyclopedias. | Colour only. **Never sole support for a scored clinical rule**, and never the source of a number that appears in teaching text. |

### The binding rule

**Every scored clinical rule cites at least one Tier A or Tier B source**, with version and
access date. Tier C and D records may be added alongside for construct grounding or readability.
INV-CIT-001 checks: (a) every scored rule has ≥1 citation id; (b) every cited id resolves;
(c) at least one resolved record has `tier: A` or `tier: B`; (d) no record has an empty
`version-or-date` or `accessed`; (e) every numeric token in teaching text sits within a span
that carries a citation reference (the harm-language lint of INV-ACT-001 shares this check).

Two consequences worth stating plainly:

- A Tier A source that is **login-gated** is still a Tier A source; §5 says how to cite it.
- A source that has **moved host or been renumbered** keeps its tier; §6 says how to cite the
  archived and successor documents together.

## 3. Adaptations that must be declared

Some anchors are used in a way their publisher did not intend, and the citation must say so in
`notes` and the teaching text must say so wherever the scale is shown:

- **NCC MERP Index (revised 2022)** indexes *actual* outcomes of medication errors. medrecsim's
  severity ordinal S0–S4 reads it as **potential worst-credible outcome**. Every citation of
  the Index for a severity ordinal carries `notes: adapted — MERP indexes actual outcomes;
  used here as potential worst-credible outcome`.
- **ISMP / CMS time-critical definition (30 minutes before or after the scheduled time)** is a
  definition of a *class* of scheduled medications and a hospital-policy expectation, not a
  per-drug rule. A per-drug time-critical flag (for example levodopa) cites the definition
  **and** a Tier A/B/C source for that drug's sensitivity to delay; see §7 and the self-review
  checklist §4.
- **MARQUIS / MATCH** describe quality-improvement toolkits; the causal-mechanism axis and the
  detectability axis are design constructs *grounded in* them, and the taxonomy document (EP-7)
  says so.

## 4. Where citations are required and where they live

| Content | Citation requirement | Location (EP-9 encodes) |
|---|---|---|
| Accepted / partially-accepted / unsafe action-set entries | ≥1 A/B per entry, or per set when the set rests on one rule; each unsafe entry's `mechanismOfHarm` cites its own source if the mechanism is not the same rule. | `reference.yaml` → `actionSets[*].citations[]` |
| Expected escalations (channel, why required, latency realism) | ≥1 A/B for *why* the escalation is expected; latency and availability are authored realism (checklist §8) and cite when they rest on regulation (e.g. OTP verification). | `reference.yaml` → `expectedEscalations[*].citations[]` |
| Discrepancy ordinals (urgency, severity, reversibility, time-to-harm) | The scale anchor (§3) once per bundle, plus a drug- or class-level A/B source when the ordinal is drug-specific. | `reference.yaml` → `discrepancies[*].citations[]` |
| Teaching notes and reveal cards | ≥1 A/B per clinical statement; every number cited. | `teaching-notes.*` → per-note `citations[]` |
| Formulary flags (high-alert, time-critical, LASA partner, tall-man) and monitoring notes | ≥1 A source per flag (the current ISMP list for high-alert and LASA; §7). | formulary package → per-entry `citations[]` |
| Taxonomy value-sets | Construct grounding (C) plus the A/B anchors named in the taxonomy document. | `docs/clinical/TAXONOMY.md` (EP-7) |

The bundle-level `citations.yaml` (D-GOV-003) holds the records; the locations above hold
references by `id`. A record cited nowhere is a validator warning; a reference to a missing
record is an error.

## 5. Login-gated sources (integrator resolution I-15)

Some authoritative sources sit behind membership or registration walls, or move behind one
after they were first cited (ECRI hosts the ISMP lists today; "Download the list" pages may
require a form at any time). The rule:

1. **Cite it publicly, bibliographically.** The record is complete (all ten keys), `url` points
   at the public landing page or bibliographic pointer, and `notes` says
   `login-gated at <accessed date>; archived copy held privately per I-15`.
2. **Archive it privately.** The retrieved copy lives under `.local/sources/<citation-id>/`
   with a short `MANIFEST.md` (retrieval date, URL, file name, SHA-256). `.local/` is line one
   of `.gitignore` (D-ROAD-002) and the pre-commit tripwire blocks any staged `.local/` path;
   the archive is never committed, never quoted at length into public files, and never
   attached to an issue.
3. **Register it as pointer-only.** The data/asset registry row
   (`source material/REGISTRY.md`) has `Redistributable = pointer-only` and the same access
   date.
4. **Never redistribute.** No excerpt beyond the short quotation a `notes` field or a teaching
   note needs; no PDF, table, or list is copied into the repository (D-DATA-006).
5. **Prefer a public equivalent where one exists.** An AHRQ PSNet mirror, a PubMed record, or a
   publisher press release that states the same rule may be cited alongside as a second,
   public record; it does not replace the primary.

If a login-gated source cannot be archived (terms forbid saving), the citation still stands with
`notes: not archivable; re-verify at each review`, and the re-review trigger (§8) applies.

## 6. Renumbered or superseded sources: the Joint Commission rule (SP-3; I-14 confirmed)

### SP-3 result (verified 2026-09-02)

Effective 1 January 2026 The Joint Commission replaced the National Patient Safety Goals (NPSG)
chapter for the **hospital** and **critical access hospital** programs with a National
Performance Goals (NPG) chapter under its Accreditation 360 reframing. Medication reconciliation
now lives under **Goal 14, "The hospital has a medication management program that focuses on
safety,"** as:

> **NPG.14.05.01** — The hospital maintains and communicates accurate patient medication
> information.

Its five elements of performance reproduce NPSG.03.06.01 EP 1–5 with only pronoun and
cross-reference changes (the closing note now points to MM.16.01.01, PC.12.02.01, and
PC.14.01.01 instead of MM.06.01.03, PC.02.03.01, and PC.04.01.05). Discrepancies are still
defined as "omissions, duplications, contraindications, unclear information, and changes"; the
"good faith effort" note is retained verbatim.

| Item | Archived goal | Successor |
|---|---|---|
| Identifier | NPSG.03.06.01 | NPG.14.05.01 |
| Goal wording | "Maintain and communicate accurate patient medication information." | "The hospital maintains and communicates accurate patient medication information." |
| Program document | *National Patient Safety Goals, Effective January 2025 for the Hospital Program* (chapter report generated 2024-10-30) | *National Performance Goals, Effective January 2026 for the Hospital Program* (chapter report generated 2025-09-26) |
| URL | https://digitalassets.jointcommission.org/api/public/content/9be383450fc941df806b76c5fbdd9ae6 | https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82 |
| Accessed | 2026-09-02 | 2026-09-02 |
| Corroboration | — | *Joint Commission Perspectives* 45(7), July 2025, "Approved: Critical Access Hospital and Hospital Requirements Streamlined to Reduce Burden" (the NPG chapter "supersedes the National Patient Safety Goals"); *2026 Hospital National Performance Goals (NPGs)* goal list (© 2026 Joint Commission). Both accessed 2026-09-02. |

Other programs did **not** reframe in 2026: the Nursing Care Center chapter *Effective January
2026* still carries NPSG.03.06.01 ("Maintain and communicate accurate patient and resident
medication information"; report generated 2025-08-11; accessed 2026-09-02). medrecsim's setting
is a hospital (D-PROD-004), so the hospital-program pair above is the one cited.

Note for EP-7: the planning appendix's request to "reverify hospital-program wording at
execution" is discharged by this table; the taxonomy's Type axis may cite NPG.14.05.01 EP 3's
discrepancy list directly.

### The rule (I-14, confirmed)

When a cited standard is renumbered or superseded, **cite both** the archived document and its
successor, each as a full record, and carry a **transition note** in the successor's `notes`:

> Successor to <old identifier> (<program>, effective <date>) under <reframing name>; wording
> <unchanged | changed: describe>. Archived record: <old citation id>.

The archived record's `notes` carries `superseded by <new citation id> effective <date>`. Both
records stay in the bundle until the next annual re-review after the successor has been in force
for twelve months, when the archived record may be withdrawn (kept, with `withdrawn` in
`notes`). Teaching text names the successor and may mention the archived identifier in
parentheses for learners who still meet it in older material.

The same rule applies to ISMP list editions (cite the edition used; when a new edition appears,
add it and mark the old one superseded), FDA labeling revisions, and REMS program changes
(SP-1 at EP-32, SP-2 at EP-29).

## 7. Approved-source pointer list v1.0 (verified this session unless marked)

Every row is a *pointer* (D-DATA-006): nothing here is redistributed. Rows are mirrored in
`source material/REGISTRY.md`. "Access" records what a public, unauthenticated fetch returned on
the access date; it is the R-6 drift signal, not a licence statement.

| Source key | Tier | Publisher · title · version-or-date | URL | Accessed | Access | Notes |
|---|---|---|---|---|---|---|
| `TJC-NPG-HAP-2026` | A | The Joint Commission · *National Performance Goals, Effective January 2026 for the Hospital Program* · effective 2026-01-01 (report 2025-09-26) | https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82 | 2026-09-02 | public PDF | NPG.14.05.01 = medication information; NPG.14.04.01 = anticoagulant therapy. jointcommission.org HTML pages returned HTTP 403 to agent fetches; the digitalassets PDFs are the citable copies. |
| `TJC-NPSG-HAP-2025` | A | The Joint Commission · *National Patient Safety Goals, Effective January 2025 for the Hospital Program* · effective 2025-01-01 (report 2024-10-30) | https://digitalassets.jointcommission.org/api/public/content/9be383450fc941df806b76c5fbdd9ae6 | 2026-09-02 | public PDF | Archived NPSG.03.06.01 (EP 1–5) and NPSG.03.05.01 (anticoagulants); cite with `TJC-NPG-HAP-2026` per §6. |
| `TJC-NPG-LIST-2026` | A | The Joint Commission · *2026 Hospital National Performance Goals (NPGs)* (goal list) · © 2026 | https://digitalassets.jointcommission.org/api/public/content/8d49c3ffa9934ffda2ff83b5ad860ea7 | 2026-09-02 | public PDF | Goal 1–14 wording. |
| `TJC-PERSPECTIVES-2025-07` | A | The Joint Commission · *Joint Commission Perspectives* 45(7), July 2025 · 2025-07 | https://digitalassets.jointcommission.org/api/public/content/integration/ingenta/publications/jcp_45_2025_07.pdf | 2026-09-02 | public PDF (store.jcrinc.com link redirects here) | Corroborates the NPSG→NPG supersession. |
| `ISMP-HIGH-ALERT-ACUTE-2024` | A | ISMP (ECRI affiliate) · *ISMP List of High-Alert Medications in Acute Care Settings* · 2024 (MS5760) | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_HighAlert_AcuteCare_List.pdf | 2026-09-02 | public PDF | Canonical host is now ECRI; legacy ismp.org paths are not relied on. Confirms: anticoagulants (class); insulin (class, U-500 special emphasis); opioids, all routes; oral sulfonylureas (glimepiride, glipiZIDE, glyBURIDE); oral methotrexate non-oncologic; tranexamic acid injection (added 2024). Landing page: https://home.ecri.org/blogs/ismp-resources/high-alert-medications-in-acute-care-settings |
| `ISMP-TMSBP-HOSP-2026-2027` | A | ISMP (ECRI affiliate) · *ISMP Targeted Medication Safety Best Practices for Hospitals* · 2026–2027 edition | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_TargetedMedicationSafetyBestPractices_Hospitals.pdf | 2026-09-02 | public PDF | Best Practice 19 (high-alert layering; targeted education names insulin, U-500 insulin, opioids, anticoagulants); **Best Practice 21** (medication reconciliation as a three-step process: collect the best possible medication history, clarify with ≥1 outside resource, prescriber reconciles). **Contains no levodopa or Parkinson-timing best practice** — see the correction note below the table. Landing page: https://home.ecri.org/blogs/ismp-resources/targeted-medication-safety-best-practices-for-hospitals |
| `ISMP-CONFUSED-NAMES-2024` | A | ISMP (ECRI affiliate) · *ISMP List of Confused Drug Names* · updated through June 2024 | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_ConfusedDrugNames.pdf | 2026-09-02 | public PDF | Incorporates FDA-approved and ISMP-recommended tall man letters. Landing page: https://home.ecri.org/blogs/ismp-resources/list-of-confused-drug-names |
| `ISMP-TIMELY-ADMIN-2011` | A | ISMP · *ISMP Acute Care Guidelines for Timely Administration of Scheduled Medications* · 2011 | https://www.ismp.org/sites/default/files/attachments/2018-02/tasm.pdf | 2026-09-02 | public PDF (legacy ismp.org path still served) | Defines time-critical scheduled medications (harm or sub-therapeutic effect if given >30 min early or late; administer within 30 min before/after). Lists universal examples; **Parkinson medications are not among them** — a hospital-defined listing. Pair with `CMS-SC-12-05-2011` and a Tier B/C Parkinson source. |
| `CMS-SC-12-05-2011` | A | CMS · *S&C-12-05-Hospital, Updated Guidance on Medication Administration, Hospital Appendix A of the SOM* · 2011-11-18 (revised 2011-12-02) | https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/downloads/scletter12_05.pdf | 2026-09-02 | public PDF | 42 CFR 482.23(c); hospitals distinguish time-critical from non-time-critical scheduled medications. |
| `NCCMERP-INDEX-2022` | A | NCC MERP · *NCC MERP Index for Categorizing Medication Errors* · revised 2022 (adopted 1996-07-16, revised 2022-07-10) | https://www.nccmerp.org/types-medication-errors | 2026-09-02 | public page + PDF | Categories A–I of **actual** outcomes; §3 adaptation statement mandatory. |
| `NIDA-WORDS-MATTER` | A | NIDA (NIH) · *Words Matter: Terms to Use and Avoid When Talking About Addiction* and *Words Matter: Preferred Language for Talking About Addiction* · undated web pages (accessed date governs) | https://nida.nih.gov/nidamed-medical-health-professionals/health-professions-education/words-matter-terms-to-use-avoid-when-talking-about-addiction and https://nida.nih.gov/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction | 2026-09-02 | public pages | Person-first language; terms to avoid. |
| `APA-BIAS-FREE-7` | B | American Psychological Association · *Bias-Free Language* (APA Style, 7th ed.) · 7th-edition guidance pages | https://apastyle.apa.org/style-grammar-guidelines/bias-free-language | 2026-09-02 | public pages | General principles; disability, age, socioeconomic-status sections. |
| `AMA-STYLE-11-INCLUSIVE` | B | AMA · *AMA Manual of Style*, 11th ed., §11.12 Inclusive Language · 2020 (online updates) | https://academic.oup.com/book/27941/chapter/207567296 | 2026-09-02 | **login-gated** (Oxford Academic subscription) | Cited bibliographically; §5 applies if an archived copy is ever needed. Public corroboration: AMWA summary https://blog.amwa.org/a-brief-guide-to-ama-inclusive-language-guidelines (Tier D, colour only). |
| `MARQUIS-BPMH-POCKET` | C | MARQUIS investigators (AHRQ grants 5R18HS019598-03, 5R18HS023757-02) · *Best Possible Medication History (BPMH) Quick Tips* pocket card · undated (MARQUIS/MARQUIS2 era) | https://www.leapfroggroup.org/sites/default/files/Files/MARQUIS%20BPMH%20Tri%20Fold%20Pocket%20Guide_1.pdf | 2026-09-02 | public PDF (third-party mirror) | Domains used by checklist §3: ≥2 sources; open-ended start; scheduled / PRN / condition-specific / subspecialist prompts; easy-to-forget forms (inhalers, nebulizers, sprays, ointments, eye and ear drops, patches, injections, suppositories); evening, weekly, monthly doses; non-prescription (OTC, vitamins, herbals, minerals); last-dose timing; adherence ("in the last week, how many days have you missed…"). Primary home: SHM Train-the-Trainer page (materials updated 2024-09) https://www.hospitalmedicine.org/clinical-topics/medication-reconciliation/best-possible-medication-history-bpmh-train-the-trainer-materials/ |
| `AHRQ-MATCH` | A | AHRQ · *Medications at Transitions and Clinical Handoffs (MATCH) Toolkit for Medication Reconciliation* · 2012 (last reviewed per site) | https://www.ahrq.gov/patient-safety/settings/hospital/match/index.html | 2026-08-23 (planning); ahrq.gov returned HTTP 403 to agent fetch on 2026-09-02 | public (blocked to agent) | **Re-verify by hand at EP-13.** |
| `WHO-HIGH5S-SOP-2014` | A | WHO (High 5s project) · *The High 5s Project — Standard Operating Protocol: Assuring Medication Accuracy at Transitions in Care* · Version 3, September 2014 (36 pp.) | https://cdn.who.int/media/docs/default-source/patient-safety/high5s/h5s-sop.pdf | 2026-09-02 (EP-7; planning 2026-08-23) | public PDF | Re-verified from the full text at EP-7: BPMH definition, discrepancy categories (undocumented intentional / unintentional), 24-hour reconciliation. Contains no allergy content. Dated; pair with `WHO-MWH-2017` when cited. |
| `WHO-MWH-2017` | A | WHO · *Medication Without Harm — WHO Global Patient Safety Challenge* · launched 2017-03-29 (web page) | https://www.who.int/initiatives/medication-without-harm | 2026-09-02 | public page | Three priority areas: polypharmacy, high-risk situations, transitions of care. Added at EP-7. |
| `AHRQ-PSNET-MEDREC-2024` | A | AHRQ PSNet · *Patient Safety Primer: Medication Reconciliation* · last updated 2024-12-15 | https://psnet.ahrq.gov/primer/medication-reconciliation | 2026-09-02 | public page | psnet.ahrq.gov is reachable to agent fetch (ahrq.gov proper is not). Added at EP-7. |
| `AHRQ-PSNET-CPOE-2025` | A | AHRQ PSNet · *Patient Safety Primer: Computerized Provider Order Entry* · last updated 2025-03-15 | https://psnet.ahrq.gov/primer/computerized-provider-order-entry | 2026-09-02 | public page | Default values and new error types (auto-population mechanism). Added at EP-7. |
| `AHRQ-LEP-GUIDE-2012` | A | AHRQ · *Improving Patient Safety Systems for Patients With Limited English Proficiency: A Guide for Hospitals* · September 2012 (AHRQ Pub. No. 12-0041) | https://psnet.ahrq.gov/issue/improving-patient-safety-systems-patients-limited-english-proficiency-guide-hospitals | 2026-09-02 | public (PSNet catalogue entry; guide body on ahrq.gov blocked to agent) | **Re-verify by hand at EP-26.** Added at EP-7. |
| `ONC-USCDI-ALLERGIES` | A | ASTP/ONC Interoperability Standards Platform · *USCDI Data Class: Allergies and Intolerances* · USCDI v1–v7 listed (page current at access) | https://isp.healthit.gov/uscdi-data-class/allergies-and-intolerances | 2026-09-02 | public page | Old healthit.gov/isp path returns HTTP 301 to this URL. Substance and reaction elements. Added at EP-7. |
| `FDA-DRUG-SHORTAGES` | A | FDA · *Drug Shortages* · page updated 2026-07-15 | https://www.fda.gov/drugs/drug-safety-and-availability/drug-shortages | 2026-09-02 | public page | Supply-interruption mechanism. Added at EP-7. |
| `CDC-NCHS-DB333-2019` | A | CDC/NCHS · *Strategies Used by Adults Aged 18–64 to Reduce Their Prescription Drug Costs, 2017* (Data Brief No. 333) · March 2019 | https://www.cdc.gov/nchs/products/databriefs/db333.htm | 2026-09-02 | public page | Construct grounding for the cost-access mechanism; percentages never carried into text. Added at EP-7. |
| `NIH-ARV-INTERRUPTION-2022` | A | NIH Clinicalinfo.HIV.gov · Adult and Adolescent ARV Guidelines, *Discontinuation or Interruption of Antiretroviral Therapy* · section dated 2022-01-20 (review timestamp 2025-09-17) | https://clinicalinfo.hiv.gov/en/guidelines/hiv-clinical-guidelines-adult-and-adolescent-arv/discontinuation-or-interruption-antiretroviral-therapy | 2026-09-02 | public (HTTP 403 to plain agent fetch; HTTP 200 with a browser user agent) | Tempo exemplar (weeks-plus). **Re-verify by hand at EP-30.** Added at EP-7. |
| `DAILYMED-CLOZAPINE-MYLAN-2026` | A | NLM DailyMed (labeler Mylan Pharmaceuticals Inc.) · *CLOZAPINE tablet* prescribing information · Revised 4/2026 (SPL published 2026-05-15; set id 883b5d43-0339-7dc1-f775-93791fb9b978) | https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=883b5d43-0339-7dc1-f775-93791fb9b978 | 2026-09-02 | public page (DailyMed search UI returned nothing to agent fetch; REST API resolved the set id) | Tempo exemplar (days); SP-1 at EP-32 governs the C11 rule. Added at EP-7. |
| `AAAAI-ACAAI-DRUG-ALLERGY-2022` | B | Joint Task Force on Practice Parameters (AAAAI/ACAAI) · *Drug allergy: A 2022 practice parameter update* · J Allergy Clin Immunol 2022;150(6):1333–1393 | https://doi.org/10.1016/j.jaci.2022.08.028 | 2026-09-02 | PubMed record (PMID 36122788); full text subscription | **Re-verify full text at EP-26 / EP-31** before an allergy scored rule cites it. Added at EP-7. |
| `MEDTAX-2019` | C | Almanasreh, Moles, Chen · *The medication discrepancy taxonomy (MedTax)…* · Res Social Adm Pharm 2020;16(2):142–148 | https://doi.org/10.1016/j.sapharm.2019.04.005 | 2026-09-02 | PubMed record + abstract (PMID 31015008); full text subscription | Type names verified via `IMFELD-MEDTAX-2020`. Added at EP-7. |
| `IMFELD-MEDTAX-2020` | C | Imfeld-Isenegger et al. · *Medication Discrepancies in Community Pharmacies in Switzerland…* · Pharmacy 2020;8(1):36 | https://doi.org/10.3390/pharmacy8010036 | 2026-09-02 | open access (PMC7151719) | Carrier of the MedTax Level 1/2 type names. Added at EP-7. |
| `ALMANASREH-REVIEW-2016` | C | Almanasreh, Moles, Chen · *The medication reconciliation process and classification of discrepancies: a systematic review* · Br J Clin Pharmacol 2016;82(3):645–658 | https://doi.org/10.1111/bcp.13017 | 2026-09-02 | open access (PMC5338112) | Added at EP-7. |
| `CORNISH-2005` | C | Cornish et al. · *Unintended medication discrepancies at the time of hospital admission* · Arch Intern Med 2005;165(4):424–429 | https://doi.org/10.1001/archinte.165.4.424 | 2026-09-02 | PubMed record + abstract (PMID 15738372) | Potential-harm rating precedent. Added at EP-7. |
| `PIPPINS-2008` | C | Pippins et al. · *Classifying and predicting errors of inpatient medication reconciliation* · J Gen Intern Med 2008;23(9):1414–1422 | https://doi.org/10.1007/s11606-008-0687-9 | 2026-09-02 | open access (PMC2518028) | History errors vs reconciliation errors. Added at EP-7. |
| `GLEASON-MATCH-2010` | C | Gleason et al. · *Results of the Medications at Transitions and Clinical Handoffs (MATCH) study…* · J Gen Intern Med 2010;25(5):441–447 | https://doi.org/10.1007/s11606-010-1256-6 | 2026-09-02 | open access (PMC2855002) | MATCH primary report (toolkit itself: `AHRQ-MATCH`). Added at EP-7. |
| `SALANITRO-MARQUIS-2013` | C | Salanitro et al. · *Rationale and design of the Multicenter Medication Reconciliation Quality Improvement Study (MARQUIS)* · BMC Health Serv Res 2013;13:230 | https://doi.org/10.1186/1472-6963-13-230 | 2026-09-02 | open access (PMC3698100) | Added at EP-7. |
| `SCHNIPPER-MARQUIS-2018` | C | Schnipper et al. · *Effects of a multifaceted medication reconciliation quality improvement intervention on patient safety: final results of the MARQUIS study* · BMJ Qual Saf 2018;27(12):954–964 | https://doi.org/10.1136/bmjqs-2018-008233 | 2026-09-02 | PubMed record + abstract (PMID 30126891) | Added at EP-7. |
| `SCHNIPPER-MARQUIS2-2022` | C | Schnipper et al. · *Effects of a refined evidence-based toolkit and mentored implementation on medication reconciliation at 18 hospitals: results of the MARQUIS2 study* · BMJ Qual Saf 2022;31(4):278–286 | https://doi.org/10.1136/bmjqs-2020-012709 | 2026-09-02 | open access (PMC10964422) | Added at EP-7. |
| `MUELLER-REVIEW-2012` | C | Mueller et al. · *Hospital-based medication reconciliation practices: a systematic review* · Arch Intern Med 2012;172(14):1057–1069 | https://doi.org/10.1001/archinternmed.2012.2246 | 2026-09-02 | open access (PMC3575731) | Added at EP-7. |

**Correction note (levodopa).** The EP-6 brief and the planning appendix attribute "levodopa
±30 minutes" to the ISMP Targeted Best Practices. The 2026–2027 edition contains no such best
practice, and the 2011 timely-administration guidelines do not name Parkinson medications among
their universal examples. The ±30-minute window is the ISMP/CMS **time-critical definition**;
levodopa's *membership* in that class is a hospital-defined listing that must be supported by a
Tier B or C source (Parkinson's Foundation hospital-care guidance; delayed-dose harm literature)
when C07 is authored (EP-28). The self-review checklist §4 is written accordingly. This is a
citation-accuracy correction, not a clinical-content change.

## 8. Drift, re-verification, and this document's log (risk R-6)

- **Triggers.** Annual re-review (D-GOV-001); any authoring session that finds a source moved,
  renumbered, login-gated, or superseded; any issue report that cites a newer edition.
- **What a session does.** Refresh `accessed`; if the host changed, update `url` and note the
  old one; if the edition changed, add a successor record per §6; if access changed to
  login-gated, apply §5; append a dated line below. Sessions may not change tiers or the rule.
- **Known drift as of 2026-09-02.** ISMP resources are hosted by ECRI (`online.ecri.org/hubfs`);
  the jointcommission.org HTML site blocks unauthenticated agent fetches (PDFs on
  `digitalassets.jointcommission.org` do not); ahrq.gov blocked agent fetches this session.
  No Tier A source needed by v1 was login-gated on the access date.
- **Drift observed at EP-7 (2026-09-02).** See the log row below; every EP-7 pointer row records
  what a public fetch returned. Rows marked "re-verify by hand" name the EP that must open the
  source before citing it as a scored rule.

| Date | Change |
|---|---|
| 2026-09-02 | v1.0 instantiated (EP-6). SP-3 executed; I-14 confirmed with the NPG.14.05.01 identifier recorded. Pointer list v1.0 (16 keys). Levodopa attribution corrected. |
| 2026-09-02 | EP-7: `WHO-HIGH5S-SOP-2014` re-verified from the full text (URL and access date refreshed). Twenty pointer rows added (`WHO-MWH-2017` … `MUELLER-REVIEW-2012`) for the taxonomy's citation register. Drift noted: healthit.gov/isp → isp.healthit.gov (HTTP 301); clinicalinfo.hiv.gov and ahrq.gov return HTTP 403 to plain agent fetches (PSNet does not); DailyMed's search UI is empty to agent fetch while its REST API works; ecfr.gov redirects agents to a block page. No tier or rule changed. |
