# Data and asset registry

The registry of every external reference input, dataset, font, icon set, or other asset that
medrecsim consults or redistributes (DECISIONS.md D-DATA-006). One row per asset. Rows are
added when an asset is first used and are kept current at every release, alongside
[THIRD-PARTY.md](../THIRD-PARTY.md), which lists what is actually redistributed.

## Rules

- Only **redistributable, license-verified, cited** material may be stored in this directory.
  Anything unvetted, login-gated, or private lives in `.local/` (gitignored) and appears here
  as a **pointer-only** row (bibliographic reference: URL, version, access date), never as a
  copy.
- **No restricted datasets, ever.** MIMIC and other credentialed datasets are not assets of
  this project and may not appear in this directory, in CI, or in any agent context. The gate
  document under `docs/` records the closed status.
- RxNorm and similar terminologies are consulted read-only during authoring and are
  **not bundled**; they get pointer-only rows.
- Every clinical source cited by a case or the formulary needs a row so the citation can be
  re-verified at the annual content review.
- Access dates are ISO (`YYYY-MM-DD`). "Update cadence" states when the row should be
  re-checked (for example "annual review", "per release", "on upstream version change").

## Registry

| ID | Asset | Type | Source URL | Version | Access date | License | Attribution? | Redistributable | Update cadence | Notes |
|----|-------|------|------------|---------|-------------|---------|--------------|-----------------|----------------|-------|
| TJC-NPG-HAP-2026 | The Joint Commission — National Performance Goals, Effective January 2026 for the Hospital Program | reference | https://digitalassets.jointcommission.org/api/public/content/9ca80055182b4274842a5780a94f2c82 | effective 2026-01-01 (report 2025-09-26) | 2026-09-02 | © Joint Commission; cited, not copied | yes (citation) | pointer-only | annual review | NPG.14.05.01 medication information; NPG.14.04.01 anticoagulants. Tier A. |
| TJC-NPSG-HAP-2025 | The Joint Commission — National Patient Safety Goals, Effective January 2025 for the Hospital Program | reference | https://digitalassets.jointcommission.org/api/public/content/9be383450fc941df806b76c5fbdd9ae6 | effective 2025-01-01 (report 2024-10-30) | 2026-09-02 | © Joint Commission; cited, not copied | yes (citation) | pointer-only | annual review | Archived NPSG.03.06.01; cited with its successor (citation policy §6). Tier A. |
| TJC-NPG-LIST-2026 | The Joint Commission — 2026 Hospital National Performance Goals (goal list) | reference | https://digitalassets.jointcommission.org/api/public/content/8d49c3ffa9934ffda2ff83b5ad860ea7 | © 2026 | 2026-09-02 | © Joint Commission; cited, not copied | yes (citation) | pointer-only | annual review | Goals 1–14 wording. Tier A. |
| TJC-PERSPECTIVES-2025-07 | Joint Commission Perspectives 45(7), July 2025 | reference | https://digitalassets.jointcommission.org/api/public/content/integration/ingenta/publications/jcp_45_2025_07.pdf | 2025-07 | 2026-09-02 | © Joint Commission; cited, not copied | yes (citation) | pointer-only | none (historical) | NPSG→NPG supersession corroboration. Tier A. |
| ISMP-HIGH-ALERT-ACUTE-2024 | ISMP List of High-Alert Medications in Acute Care Settings | reference | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_HighAlert_AcuteCare_List.pdf | 2024 (MS5760) | 2026-09-02 | © ISMP 2024; internal non-commercial reproduction with attribution only — not redistributed here | yes (citation) | pointer-only | on upstream edition change; annual review | Hosted by ECRI. Tier A. |
| ISMP-TMSBP-HOSP-2026-2027 | ISMP Targeted Medication Safety Best Practices for Hospitals | reference | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_TargetedMedicationSafetyBestPractices_Hospitals.pdf | 2026–2027 edition | 2026-09-02 | © ISMP; cited, not copied | yes (citation) | pointer-only | biennial edition; annual review | Best Practices 19 and 21 cited. Tier A. |
| ISMP-CONFUSED-NAMES-2024 | ISMP List of Confused Drug Names | reference | https://online.ecri.org/hubfs/ISMP/Resources/ISMP_ConfusedDrugNames.pdf | updated through June 2024 | 2026-09-02 | © ISMP 2024; cited, not copied | yes (citation) | pointer-only | on upstream edition change; annual review | FDA and ISMP tall man letters included. Tier A. |
| ISMP-TIMELY-ADMIN-2011 | ISMP Acute Care Guidelines for Timely Administration of Scheduled Medications | reference | https://www.ismp.org/sites/default/files/attachments/2018-02/tasm.pdf | 2011 | 2026-09-02 | © ISMP 2011; cited, not copied | yes (citation) | pointer-only | annual review (host drift: ismp.org → ECRI) | Time-critical definition (±30 min). Tier A. |
| CMS-SC-12-05-2011 | CMS S&C-12-05-Hospital: Updated Guidance on Medication Administration (SOM Appendix A) | reference | https://www.cms.gov/medicare/provider-enrollment-and-certification/surveycertificationgeninfo/downloads/scletter12_05.pdf | 2011-11-18 (rev. 2011-12-02) | 2026-09-02 | US Government work (public domain) | no | pointer-only | none (historical) | 42 CFR 482.23(c) timing guidance. Tier A. |
| NCCMERP-INDEX-2022 | NCC MERP Index for Categorizing Medication Errors | reference | https://www.nccmerp.org/types-medication-errors | revised 2022 | 2026-09-02 | © NCC MERP; cited, not copied | yes (citation) | pointer-only | annual review | Adapted as potential worst-credible outcome (citation policy §3). Tier A. |
| NIDA-WORDS-MATTER | NIDA — Words Matter (terms to use and avoid; preferred language) | reference | https://nida.nih.gov/nidamed-medical-health-professionals/health-professions-education/words-matter-terms-to-use-avoid-when-talking-about-addiction | undated web pages | 2026-09-02 | US Government work (public domain) | no | pointer-only | annual review | Second page: …/research-topics/addiction-science/words-matter-preferred-language-talking-about-addiction. Tier A. |
| APA-BIAS-FREE-7 | APA Style — Bias-Free Language (7th ed.) | reference | https://apastyle.apa.org/style-grammar-guidelines/bias-free-language | 7th ed. guidance pages | 2026-09-02 | © APA; cited, not copied | yes (citation) | pointer-only | annual review | Tier B. |
| AMA-STYLE-11-INCLUSIVE | AMA Manual of Style, 11th ed., §11.12 Inclusive Language | reference | https://academic.oup.com/book/27941/chapter/207567296 | 11th ed. (2020, online updates) | 2026-09-02 | © AMA / OUP; login-gated | yes (citation) | pointer-only | annual review | Login-gated: cited bibliographically per I-15; no archived copy held yet. Tier B. |
| MARQUIS-BPMH-POCKET | MARQUIS — Best Possible Medication History (BPMH) Quick Tips pocket card | reference | https://www.leapfroggroup.org/sites/default/files/Files/MARQUIS%20BPMH%20Tri%20Fold%20Pocket%20Guide_1.pdf | undated (MARQUIS era; AHRQ-funded) | 2026-09-02 | © MARQUIS investigators / SHM; cited, not copied | yes (citation) | pointer-only | annual review | Primary home: SHM BPMH Train-the-Trainer page. Tier C. |
| AHRQ-MATCH | AHRQ — MATCH Toolkit for Medication Reconciliation | reference | https://www.ahrq.gov/patient-safety/settings/hospital/match/index.html | 2012 (last reviewed per site) | 2026-08-23 (planning); fetch blocked 2026-09-02 | US Government work (public domain) | no | pointer-only | re-verify at EP-13 | Tier A. |
| WHO-HIGH5S-SOP-2014 | WHO — High 5s Standard Operating Protocol: Assuring Medication Accuracy at Transitions in Care | reference | (WHO High 5s project page) | v3, 2014 | 2026-08-23 (planning) | © WHO; cited, not copied | yes (citation) | pointer-only | re-verify at EP-7 | Tier A. |

Column key: **Type** = reference / dataset / terminology / font / icon / image / other ·
**Attribution?** = yes / no (whether the license requires attribution and where it is given) ·
**Redistributable** = yes / no / pointer-only.

All rows above are pointer-only reference sources from the approved-source list in
[docs/clinical/CITATION-POLICY.md](../docs/clinical/CITATION-POLICY.md) §7 (EP-6, 2026-09-02).
No asset is redistributed yet; `THIRD-PARTY.md` is unaffected.
