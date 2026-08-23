# EP-13 — Formulary wave 1

**Size:** M · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-9 (Content schema v0 + validator core), EP-6 (Clinical governance specs), EP-7 (Discrepancy taxonomy v1) · **Blocks:** EP-14 (Case C01 exemplar + review), EP-33 (Formulary wave 2)

## Context

Authors the first wave of the curated synthetic formulary (D-DATA-001): ~70–90 roster-critical
entries covering the planned 11-case roster, C01's needs first. Real generic names, original
descriptions, no bundled external terminology; RxNorm consulted read-only during authoring. The
formulary is its own versioned content package (D-DATA-004; integrator resolution I-2: a
content directory, not an npm package); cases reference formulary IDs, never free-text names.
Entry fields follow the EP-9 schema; flags cite Tier-A sources per the EP-6 format. Roster and
hazard requirements: [appendices/clinical-model.md](appendices/clinical-model.md) §2. Assumes
OQ-5 (150–250 treated as a target band; wave 1 is ~70–90 regardless of the ruling).

## Safety & policy preconditions

- Synthetic-only content: real **generic names** are in scope by decision (D-DATA-001); brand
  names are fictional originals only, screened per the EP-10 convention; pill descriptions are
  authored text, never copied monograph text.
- Clinical sign-off (D-EXEC-003): high-alert / time-critical / LASA flags and monitoring notes
  are clinical content — **owner sign-off gate below; this brief is not done without it.**
- Harm language (D-SCOR-003): monitoring notes use plausible-consequence phrasing; any number
  carries a citation ref (harm-language lint applies).
- Leak prevention: authoring references consulted online; nothing proprietary or login-gated
  copied into the repo (I-15 pointer/archive procedure via EP-6 policy).
- Licensing/attribution (D-DATA-006): formulary content is CC BY 4.0; SPDX headers per EP-9;
  cited sources get registry pointer rows where applicable.
- Accessibility (D-UX-004): `pillAppearanceText` (nonvisual text descriptor) authored for every
  entry — this is the D-UX-004 nonvisual pill cue.
- Security baseline (D-SEC-001): n/a beyond standing rules.

## In scope

1. `content/formulary/` package: package meta (formularyVersion, schemaVersion) + ~70–90
   entries. Priority order: C01's medications first, then the roster hazard set.
2. Per entry (EP-9 schema): id, genericName, class, forms/strengths (+ concentrationNote where
   it matters — U-500 vs U-100 insulin), combinationComponents, lasaPartners (bidirectional),
   highAlert, timeCritical, monitoringNotes (cited), pillAppearanceText, brandNamesFictional,
   narrowTherapeuticIndex.
3. Cover the roster's hazard set: levodopa/carbidopa (+ entacapone, IR vs CR), U-500 + U-100
   insulins (aspart), apixaban + warfarin, methadone, clozapine, bictegravir/FTC/TAF,
   prednisone, glipizide/glimepiride (LASA pair with tall-man flags), metoprolol
   succinate/tartrate + fictional brand, omeprazole/pantoprazole, furosemide, levothyroxine,
   amlodipine, HCTZ, ezetimibe, statins, TMP-SMX, plus C01's remaining meds and common OTC
   (ibuprofen, naproxen, calcium/vitamin D, potassium supplement).
4. Tier-A citation (version + access date) for every highAlert, timeCritical, LASA, and
   monitoring-note flag: ISMP high-alert list, ISMP Confused Drug Names, DailyMed/FDA labels,
   etc., in the EP-6 YAML format.
5. `validate --all` green, including LASA bidirectionality (via INV-REF checks as shipped;
   anything deferred to EP-20 noted).
6. Prepare the owner-review package: a flags summary table (entry → flags → citation) and the
   EP-6 review-record template pre-filled to "ready-for-review".

## Out of scope

- Entries beyond the roster-critical set / padding toward the 150 floor → EP-33 (OQ-5).
- Case bundles that consume the formulary → EP-14 and later case EPs.
- Any schema field change → EP-9's package + a logged decision.

## Owner checkpoints

- **Owner sign-off gate (explicit):** the owner reviews the clinical flags and monitoring notes
  and signs a versioned, dated **public review record** for the formulary package (EP-6
  template; "physician-reviewed (single reviewer)"). **Agent work stops at "ready-for-review";
  this brief is NOT done until the signed public review record is committed** beside the
  package. *(judgement — owner)*

## Verification / acceptance

- `validate --all` green; entry count in the 70–90 band; every flag row has ≥1 Tier-A citation
  (scripted check over the YAML, or validator warn-count = 0 for citation-presence).
- Every entry has non-empty pillAppearanceText.
- No real brand name anywhere (denylist check); fictional brands screened.
- The signed public review record exists with disposition, date, and versions *(judgement —
  owner signs)*.
- `main` runnable, CI green.

## Handoff

Standard fields, plus: entry inventory vs the roster's needs (any gaps named for EP-33); the
review-record status — if sign-off is pending, the handoff states **"ready-for-review; awaiting
owner sign-off; EP not done"** and lists exactly what the owner must read.

## Parked → final-roadmap.md

Candidate distractor-entry list for OQ-5 padding (recorded, not authored) if identified.
