# docs/clinical — clinical governance instruments

The gate instruments every piece of clinical content passes through (D-GOV-001 lifecycle:
draft → automated validation → clinical self-review → stigma-safety review → public review
record → publish). Instantiated at EP-6 and EP-7 (2026-09-02) from the planning appendix
[roadmap/appendices/clinical-model.md](../../roadmap/appendices/clinical-model.md) §1 and §5–7. Each
instrument carries its own version number and date; changes to the instruments are owner-only
and are logged inside each file.

| Instrument | Version | Purpose |
|---|---|---|
| [CITATION-POLICY.md](CITATION-POLICY.md) | 1.0 (2026-09-02) | Citation record shape; approved-source tiers A–D; the rule that every scored clinical rule cites ≥1 Tier A or B source; login-gated (I-15) and renumbered-source (I-14) procedures; SP-3 result (Joint Commission NPSG.03.06.01 → NPG.14.05.01); approved-source pointer list with access dates. |
| [CLINICAL-SELF-REVIEW-CHECKLIST.md](CLINICAL-SELF-REVIEW-CHECKLIST.md) | 1.0 (2026-09-02) | Twelve-section structured self-review run by the owner on every bundle: truth-layer consistency, plausibility, BPMH fidelity, high-alert and LASA audits, discrepancy metadata, action sets, escalation realism, harm language (D-SCOR-003 quoted), citations, scope, sign-off. |
| [STIGMA-SAFETY-CHECKLIST.md](STIGMA-SAFETY-CHECKLIST.md) | 1.0 (2026-09-02) | Eleven-item language and framing review (NIDA, APA, AMA sources): person-first language, banned terms, recurrence framing, systems framing, agency, credibility, NPC tone, no patient-experience claims; roster-level stereotype audit hook for EP-35. |
| [REVIEW-RECORD-TEMPLATE.md](REVIEW-RECORD-TEMPLATE.md) | 1.0 (2026-09-02) | The public `review-record.yaml`, the fixed review-model string **physician-reviewed (single reviewer)**, dispositions, re-review triggers, and the `preBriefBadge` fields the app renders (with the amber staleness rule). |
| [TAXONOMY.md](TAXONOMY.md) | 1.0 (2026-09-02) | The five-axis discrepancy taxonomy (D-TAX-001): type (13), causal mechanism (14, four strata), detectability (7), urgency U1–U4, harm class (severity S0–S4 as potential worst-credible outcome, reversibility, time-to-harm); phenotype predicates for the coverage matrix; divergence notes; the enum export EP-9 imports verbatim; a 30-record citation register. |

Executed review records live beside each case bundle, not here.

**Location note.** The EP-6 brief allowed `docs/clinical/` or a logged alternative; this
directory was chosen so that governance instruments sit with the other `docs/` policies (claims,
release criteria, threat model) while staying distinct from the case content tree that EP-9 will
create.
