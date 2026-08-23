# final-roadmap — conditional branches & parked ideas

v1 scope is frozen (D-RISK-002; [charter](charter.md) §3). Everything here is **conditional**:
a branch opens only when its entry criteria pass and the owner records a go decision in
[../DECISIONS.md](../DECISIONS.md). Nothing here is a promise, and nothing in v1 may silently
depend on it. Mid-build ideas land in §3 via the parking rule — never in a running EP.

## 1. v1.x candidate branches (each with entry criteria)

| Branch | What | Entry criteria |
|---|---|---|
| B-1 External records exchange + claims-feed sources | Two more evidence-source types (D-WF-001 deferral) | v1.0 shipped; case designs identified that these sources uniquely teach; schema extension reviewed |
| B-2 Transfer / perioperative admission settings | New settings beyond ED admission (D-PROD-004) | v1.0 shipped; setting-specific evidence/source model designed; review capacity for new case wave |
| B-3 Facilitated / group mode | Projection, pause points, facilitator notes (D-PROD-003) | Demand signal from educators; UX design; no stored-performance creep without B-5 gates |
| B-4 Session summary export | Learner-initiated local file export | New privacy analysis (stored-performance artifact); wording review against assessment claims |
| B-5 Learner pilot & outcome evidence | Real learners, learning-outcome claims (D-PROD-006) | Consent framework; IRB determination; assessment-validity plan; not before dual review (B-6) |
| B-6 Pharmacist dual review upgrade | Independent pharmacist/med-safety review of all cases (D-CLIN-001 trigger) | Reviewer recruited; review protocol extended; badges/claims upgraded repo-wide |
| B-7 Lived-experience review | Patient/lived-experience review before any patient-perspective claims (D-GOV-004 trigger) | Reviewers engaged; scope defined; compensation/ethics considered |
| B-8 Transplant immunosuppressants case; insulin-pump case | Deferred high-alert content (D-TAX-003) | B-6 recommended first (specialist review depth); roster slot justified by coverage goals |
| B-9 Formal usability study | Beyond the informal v1 protocol (D-UX-005) | Protocol; participant consent; possibly IRB depending on design |
| B-10 GUI case-authoring tool | Form-based authoring over the schema (D-DATA-005) | ≥2 external case authors actually exist; schema stable ≥1 major |
| B-11 LLM-assisted authoring | Offline, human-adjudicated, disclosed (D-AI-001 gate) | Necessity/cost/privacy analysis; strict schemas + deterministic checks; expert review of outputs; disclosure text |
| B-12 Translations / localization | UI chrome first, content later | Translation review capacity; CC BY workflow for content variants |
| B-13 Public case-study write-up | Standalone narrative doc (OQ-11) | v1.0 shipped; owner drafts; claims-matrix rows for every statement |

## 2. v2 conditional branches

| Branch | What | Entry criteria |
|---|---|---|
| B-20 Constrained procedural case variation | Perturbing doses/names/timings within authored envelopes (D-CASE-001) | Validation gate: every generated variant is an unreviewed clinical artifact until a review/constraint framework proves otherwise; property-test + clinical-envelope design; owner go |
| B-21 MIMIC research adapter | Aggregate, disclosure-safe distributional realism to inform human authoring — the only named candidate goal (D-MIMIC-002) | **Closed 4-step gate (D-MIMIC-001), instantiated as `docs/MIMIC-GATE.md` at EP-4:** (1) written goal + construct memo; (2) then-current PhysioNet credentialing/CITI/DUA/responsible-LLM-use verification + IRB determination; (3) bounded read-only feasibility spike with disclosure-safety checks; (4) explicit owner go in DECISIONS.md. Hard rules: no restricted data near agents/CI/this repo ever; derivatives nonpublic by default; abandonment is the default trajectory. Never a v1 dependency; synthetic pipeline is the permanent fallback. |

## 3. Parked ideas (D-RISK-002 parking rule)

| ID | Idea | Origin | Status |
|---|---|---|---|
| P-001 | Authored end-trigger pressure variant ("you're paged to the next admission") | Discovery Q-WF-004(b) | **Adjudicated 2026-08-23 (OQ-4 ruling): deferred to v1.x** |
| P-002 | Dismissible authored "pharmacy flag" interruption (alert-fatigue teaching) | Discovery Q-SCOR-002 | **Adjudicated 2026-08-23 (OQ-4 ruling): deferred to v1.x** — the alert-fatigue lesson is taught in debrief text at v1 |

Append new parked entries below with ID, one-line description, origin EP, and date.
