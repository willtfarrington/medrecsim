# Name & identity screening record

Executes D-OSS-004 (name/identity screening before the v1 visibility push) per the protocol in
[roadmap/appendices/governance-security.md](../roadmap/appendices/governance-security.md) §8
and spike SP-10. This file is the standing record: every venue, its query method, the date it
was run, the result, and a collision grade. New runs are appended, never overwritten; the
latest dated run is the operative one.

> **Informal screening; not legal advice.** Records here were produced by the project owner
> and/or an AI-assisted session from public sources only. They are not a trademark clearance
> search and do not substitute for a professional search or legal opinion. Naming responses
> are owner-only decisions (D-EXEC-003).

## Protocol — the six venues

| # | Venue | Method | What counts as a hit |
|---|-------|--------|----------------------|
| V1 | GitHub | REST search API for repositories, users, and organizations named `medrecsim` or the spaced/hyphenated variants | Any other repository, user, or org using the name for a software project |
| V2 | npm registry | `GET https://registry.npmjs.org/<name>` (404 = free) for `medrecsim`, hyphenated variants, and the `@medrecsim` scope; registry full-text search | Any published package or claimed scope |
| V3 | PyPI | `GET https://pypi.org/pypi/<name>/json` (404 = free) for `medrecsim`, `med-rec-sim`, `medrec-sim` | Any published project |
| V4 | Domains (RDAP) | `https://rdap.org/domain/<name>` followed to the registry RDAP server (404 = not registered) for `.com`, `.net`, `.org`, plus `.io`, `.app`, `.dev` | Any registered domain |
| V5 | USPTO trademarks | **Manual session** on the official Trademark Search (tmsearch.uspto.gov): word-mark queries in classes 009 / 041 / 042 / 044 for the name and its phonetic variants (list below); programmatic screening against a daily-updated mirror of USPTO records as a supplement | Live registration or pending application for an identical or confusingly similar mark in a related class |
| V6 | General web + app stores | Web search for the name, spaced/hyphenated variants, and `"MedRecSim"`; Apple App Store search API; Google Play search page; PubMed for the name | Any product, service, publication, or app using the name |

**Phonetic / spelling variants (used in V5 and V6):** MEDRECSIM · MED REC SIM · MEDREC SIM ·
MED-REC-SIM · MEDREKSIM · MEDREXIM · MEDRECKSIM · MEDRECSYM · MEDREKSYM · adjacent stems
MEDREC, MED REC, MEDSIM, MED SIM.

## Collision grades

| Grade | Definition | Response |
|-------|-----------|----------|
| **L0** | No hit at all in the venue. | Proceed. |
| **L1** | Adjacent only: a different name sharing a stem or sound (e.g. MEDREC, MEDSIM), or the same name in an unrelated field where confusion is implausible. | Proceed; note the adjacency; keep the persistent non-affiliation statement (D-UX-006). |
| **L2** | Same or near-identical name (differing only in spacing, case, punctuation, or one letter) used in a related field — healthcare, medical education, simulation, or software — **without** a live trademark registration or pending application in a relevant class; or a live registration on a merely similar mark whose goods overlap ours. | **Owner decision** before the v1 visibility push: keep as-is, keep with an explicit disambiguation statement, or rename. |
| **L3** | Identical or confusingly similar mark with a **live** USPTO registration or pending application in classes 009/041/042/044, or an actively distributed product/app/service using the identical name in the same field. | **Rename before the visibility push** (a GitHub repository rename auto-redirects; the Pages URL changes with it). |

The overall grade is the highest grade found in any venue. L2+ pauses the EP and goes to the
owner with the evidence; L3 is a rename trigger (owner executes; nothing here renames anything).

## Response ladder

1. **L0/L1** — no action; record and move on. EP-10 may proceed with the current name.
2. **L2** — present to the owner with evidence. Options the owner may choose between:
   (a) keep the name unchanged; (b) keep the name and add an explicit "not affiliated with or
   derived from [other project]" line to the README/about surface (an outward claim, so it
   needs a `docs/CLAIMS.md` row at EP-5); (c) rename now, before any visibility push, while the
   cost is one repository rename and a handful of doc edits. EP-10 waits for the ruling.
3. **L3** — rename before the visibility push. Steps: owner picks a new name and re-runs this
   protocol on it; `gh repo rename` (old URL redirects; update the Pages URL everywhere it is
   cited: README, CITATION.cff, SECURITY.md, roadmap); update `name` in CITATION.cff and any
   package manifests; record the decision in DECISIONS.md.
4. **Any grade** — no defensive domain registration (OQ-10 ruling). Re-run the protocol at
   EP-19 (v0.1) and EP-38 (v1.0) as part of release criteria, and whenever a confusion report
   arrives (risk R-15).

## Run 1 — preliminary, 2026-08-23 (planning time)

Recorded from roadmap/appendices/governance-security.md §8; reproduced here for the dated trail.

| Venue | Result (2026-08-23) | Grade |
|-------|---------------------|-------|
| V1 GitHub | Only this repository. | L0 |
| V2 npm | Name free. | L0 |
| V3 PyPI | Name free. | L0 |
| V4 Domains | medrecsim.com / .net / .org unregistered. | L0 |
| V5 USPTO | **Inconclusive** — programmatic query failed; manual session deferred to EP-3 (SP-10). | — |
| V6 Web | No exact match. Nearest: "MedRecs Management" (records-release service), a MedSim / MedSimAI simulation cluster, "Medrec:M" (patient-record app). | L1 |

Preliminary reading: L1, USPTO outstanding.

## Run 2 — EP-3 re-verification, 2026-09-02

All programmatic checks were run 2026-09-02 between 19:28 and 19:37 UTC from an AI-assisted
session; nothing but public endpoints was queried and no account data was used or stored.

### V1 — GitHub (L0)

| Query | Result |
|-------|--------|
| `search/repositories?q=medrecsim` | 1 result: `willtfarrington/medrecsim` (this project). |
| `search/repositories?q=MedRecSim in:name` | Same single result. |
| `search/repositories?q=medrec-sim` | 0 results. |
| `search/repositories?q=med-rec-sim`, `q=med_rec_sim` | 27 results each, all unrelated substring matches (imaging reconstruction, "simple medical record" projects, etc.); none named MedRecSim or any variant. |
| `search/users?q=medrecsim` | 0 results. |
| `orgs/medrecsim` | 404 (no organization of that name). |
| Code search `"Med Rec Sim"` | 0 results (the VCU project in V6 has no public GitHub footprint under that name). |

### V2 — npm (L0)

| Query | HTTP | Meaning |
|-------|------|---------|
| `registry.npmjs.org/medrecsim` | 404 | free |
| `registry.npmjs.org/med-rec-sim`, `/medrec-sim`, `/medrec_sim` | 404 | free |
| `registry.npmjs.org/@medrecsim%2Fmedrecsim` | 404 | no package under an `@medrecsim` scope |
| `registry.npmjs.org/-/v1/search?text=medrecsim` | 200, `"total":0` | no package mentions the name |

(`npmjs.com/org/medrecsim` and `/~medrecsim` return 403 to non-browser clients, so scope/user
ownership of the *name* itself could not be confirmed from the session; the registry results
above are the load-bearing check. EP-8 decides whether an npm scope is needed at all.)

### V3 — PyPI (L0)

`pypi.org/pypi/medrecsim/json`, `/med-rec-sim/json`, `/medrec-sim/json` → all 404 (free).

### V4 — Domains via RDAP (L0)

| Domain | Registry RDAP server reached | HTTP | Meaning |
|--------|-----------------------------|------|---------|
| medrecsim.com | rdap.verisign.com | 404 | not registered |
| medrecsim.net | rdap.verisign.com | 404 | not registered |
| medrecsim.org | rdap.publicinterestregistry.org | 404 | not registered |
| medrecsim.app | pubapi.registry.google | 404 | not registered |
| medrecsim.dev | pubapi.registry.google | 404 | not registered |
| medrecsim.io | rdap.identitydigital.services | 404 | not registered |

No defensive registration per OQ-10; the GitHub Pages URL is canonical.

### V5 — USPTO trademarks (SP-10) — provisional L1; official manual session outstanding

**Official venue status.** The USPTO's Trademark Search application (tmsearch.uspto.gov) is a
browser single-page app behind an AWS WAF browser challenge and publishes no public search
API; the retired backend path answers `405` from static hosting, the Open Data Portal search
endpoint answers `403` without a registered key, and TSDR answers `401`. A scripted session
therefore cannot run the manual search. **Blocker recorded; owner notified in
docs/handoffs/EP-3.md.** The manual session is a ~15-minute browser task using the query list
at the end of this section.

**Supplementary programmatic screen (2026-09-02, ~19:36 UTC).** Queried a third-party mirror of
USPTO trademark records (tmsearchapi.com, "13 million+ USPTO records, updated daily"; free
tier, no key, screening-only by its own terms) via `GET /search/mark?q=…&limit=50`:

| Query | Results | Reading |
|-------|---------|---------|
| `medrecsim` | 0 | no identical mark |
| `med rec sim` | 0 | no identical spaced mark |
| `medreksim` | 0 | phonetic variant clear |
| `medrexim` | 0 | phonetic variant clear |
| `medrec` (stem) | 33 records; relevant ones below | adjacency only |
| `medsim` (stem) | 9 records; relevant ones below | adjacency only |

Adjacent records in or near classes 009/041/042/044 (status codes are USPTO codes as
reported by the mirror; meanings from the USPTO Trademark Applications Daily XML documentation:
700 = registered, 800 = registered and renewed, 710 = cancelled §8, 602/606 = abandoned,
688 = notice of allowance issued, 630 = new application, 404 = certification rejected by MPU):

| Mark | Serial / Reg. | Status | Class | Owner (as recorded) | Relevance |
|------|---------------|--------|-------|---------------------|-----------|
| MEDREC² | 88126910 / 6054128 | 700 registered | 042 | DGN Pharmacy Inc. | **Closest live mark.** SaaS "featuring software for medication reconciliation, excluding medical research" (Justia listing; filed 2018-09-21, registered 2020-05-12). Shares the MEDREC stem and the medication-reconciliation subject; differs in the SIM element, in being a commercial SaaS, and in our non-commercial educational use. |
| MEDSIMS | 90300606 / 6439768 | 700 registered | 042 | WebMD, LLC | Medical simulation software; shares the MED…SIM sound, not the REC element. |
| MEDSIMCENTER | 97589393 / 7290692 | 700 registered | 035 | Market Modelers, LLC | Different class and services. |
| MEDRECONCILIATION | 77884570 / 4388399 | 800 renewed | 036 | Medimpact Healthcare Systems, Inc. | Descriptive of the subject; financial-services class. |
| MEDRECALL | 99616900 | 688 allowed (pending) | 009 | MedRecall | Different word; recall, not reconciliation. |
| MEDSIMULATION | 79135509 / 4590752 | 404 | 009,035,037,041,042 | Karl Storz SE & Co. KG | Madrid-protocol record; different word. |
| MEDREC (×4 registrations) | 73244573 / 75380596 / 75453197 / 77106396 | 710 cancelled | 035, 042, 009, 035 | various | Dead. Shows MEDREC has been used descriptively by many parties over decades. |
| MEDREC, MEDREC911, MEDREC…, MEDREC360, MEDRECORDS, etc. | various | 602 / 606 abandoned | 009/042/044 | various | Dead. |

Provisional V5 grade: **L1** — no identical or phonetic-variant mark, live or dead; the
nearest live registration (MEDREC²) is a different mark on commercial SaaS. This grade is
provisional until the owner's official session confirms it. If that session surfaces a live
mark that the mirror missed, re-grade per the table above.

**Owner manual-session checklist (official venue).** At https://tmsearch.uspto.gov → basic
search, word mark, then expert search with `IC:009 OR IC:041 OR IC:042 OR IC:044`; run each of
MEDRECSIM · "MED REC SIM" · MEDREKSIM · MEDREXIM · MEDRECKSIM · MEDRECSYM · MEDREC* · MEDSIM* ·
"MED REC" · "MED SIM"; record for each: date, live/dead count, any live mark with an identical
word element or identical goods, and the grade. Append the result as "Run 3" below this
section and update the overall verdict.

### V6 — General web + app stores (L2 — owner decision)

| Query | Result |
|-------|--------|
| Web: `"medrecsim"` | No exact match. Returned adjacent: MedRecs Management (records-release service), MedSim (India e-learning), Med Sim Studio, MedSim (UC Davis patient simulator), Medrec:M Clinic (Sirma Medical Systems). All L1. |
| Web: `"med rec sim" OR "medrec sim" medication reconciliation simulation` | **Exact spaced-name hit:** "Med Rec Sim" — see below. Everything else generic (MedEdPORTAL simulation curricula, SimMed, SimPHARM). |
| Web: `"MedRecSim" OR "MedRec Sim" trademark` | Same Med Rec Sim article; MIT Media Lab "MedRec" (blockchain records research); dead MEDREC trademarks (Justia). No MedRecSim trademark. |
| Web: `"medrecsim" OR "med-rec-sim"` restricted to github.com / huggingface.co / streamlit.app / vercel.app | No exact match; MedAgentSim, MedSim3D, medisim, MedRec (records app) are L1 adjacents. |
| Web: `"Med Rec Sim"` + VCU / pharmacy / 2024–2026 | Only the single 2023 Medium article; no institutional page, paper, hosted URL, or later mention found. |
| PubMed: `"Med Rec Sim" OR "MedRecSim" OR (Wijesinghe[Author] AND medication reconciliation AND simulation)` | 2 hits, both unrelated (term-tokenisation noise). No publication under the name. |
| Apple App Store search API: `medrecsim` | 9 generic results (Medscape, MEDITECH MHealth, UpToDate, …); none named MedRecSim. |
| Apple App Store search API: `med rec sim` | Hospital-sim games and Full Code Medical Simulation; none named MedRecSim. |
| Apple App Store search API: `medrec` | Medrec:M, Medrec:M Clinic (Sirma Medical Systems AD), Medrec-Q Dictate; L1 adjacents. |
| Google Play search page: `medrecsim` | Page rendered with zero app-detail links (no results). |

**The L2 finding — "Med Rec Sim" (Virginia Commonwealth University School of Pharmacy, 2023).**

- Source: Medium article "Smart Learning for Pharmacists: Med Rec Sim Provides AI-Powered
  Medication Reconciliation Training by Harnessing the Capabilities of OpenAI's GPT-4 Model",
  by Dayanjan S. Wijesinghe with Autumn Brenner, Austin Barfield and Kristin Zimmerman, VCU
  School of Pharmacy; published 2023-07-22, last modified 2023-09-13; text shared under a
  CC 4.0 licence. The page uses both spellings "Med Rec Sim" and "MedRecSim".
- What it is: a Streamlit chat app run in Google Colab and exposed via ngrok, in which GPT-4
  role-plays a 65–80-year-old patient with a generated medication list for a *student
  pharmacist* to reconcile; the article publishes the system prompt and code.
- Footprint (2026-09-02): no GitHub repository, package, domain, app-store listing, trademark
  application, institutional page, or peer-reviewed publication under the name was found; no
  mention later than 2023. It reads as a published teaching prototype, not a distributed
  product.
- Why L2 and not L3: the name differs only by spacing and it is in the same field
  (medication-reconciliation training simulation), so confusion is plausible; but there is no
  live trademark, no distributed product, and no evidence of continuing use.
- Why it matters anyway: search engines already return that article for `"med rec sim"`
  queries. A learner or reviewer who hears "medrecsim" spoken could land on it. The projects
  also differ in ways we care about: theirs is LLM-driven and pharmacist-facing; ours is
  deterministic, authored, no-runtime-LLM (D-AI-001) and resident-facing.

## Overall verdict (2026-09-02)

| Venue | Grade |
|-------|-------|
| V1 GitHub | L0 |
| V2 npm | L0 |
| V3 PyPI | L0 |
| V4 Domains | L0 |
| V5 USPTO | L1 (provisional; official manual session outstanding) |
| V6 Web + app stores | **L2** — "Med Rec Sim" (VCU, 2023) |
| **Overall** | **L2 → owner decision required** (response ladder step 2). EP-10 waits for the ruling. |

**Owner ruling (2026-09-02):** keep `medrecsim` unchanged (response-ladder option a). No
disambiguation line is added now; the standing non-affiliation banner (D-UX-006) covers the
adjacency, and a confusion report naming the VCU prototype is an R-15 trigger for revisiting.
The official USPTO manual session (Run 3) is scheduled by the owner **before EP-19** (the v0.1
visibility push); until then V5 stays provisional L1. With the L2 ruled on, **EP-10 may
proceed with the current name.** Recorded in docs/handoffs/EP-3.md.

## Fictional in-sim name-screening rule

Every fictional identity that appears in the simulation — hospital, clinics, community
pharmacies, outpatient practices, programs (for example an opioid-treatment program), provider
and staff names, and patient names — is screened **before the first case that uses it is
published**, using venues V4, V5 and V6 of this protocol adapted to the name (V1–V3 do not
apply to in-sim names):

1. Web search for the exact name and the name plus its city/state and plus "hospital",
   "pharmacy", "clinic", or "MD" as appropriate; a hit on a real organisation of the same kind
   in the United States, or on a notable living or recently deceased person for a provider or
   patient name, is L2 and the name is changed (fictional names are free to change, so the
   owner-decision step collapses to "rename").
2. Domain RDAP check for `<name>.com`; a registered domain belonging to a healthcare
   organisation is L2.
3. USPTO mirror query on the name's distinctive element for classes 042/044; a live mark on
   the same words for healthcare services is L2.
4. Identifiers stay visibly fictional (555-01XX phone numbers, non-validating NPIs, synthetic
   MRNs, barcodes encoding SYNTHETIC — EP-10) so that even a coincidental name cannot be
   mistaken for a real record.
5. Patient names are additionally checked against the stigma-safety guidance in
   roadmap/appendices/ux-accessibility.md §10 (respectful cross-cultural names; a condition is
   never "explained" by ethnicity or class).

The registry that stores each screened name with its screening note (date, venues, grade) is
built in EP-10 (integrator resolution I-9); per-case execution and re-screening happen inside
each case EP, and a name that fails after publication is changed in a content patch with a
changelog entry.

---
*Informal screening; not legal advice. Every row above is a public-source observation dated
as shown; it is neither a trademark clearance nor a legal opinion.*
