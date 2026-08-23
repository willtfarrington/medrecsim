# EP-33 — Formulary wave 2

**Size:** S · **Type:** content · **Core/Stretch:** core ·
**Depends on:** EP-13 (Formulary wave 1) · **Blocks:** EP-35 (Roster closure audit)

## Context

EP-13 delivered the ~70–90 roster-critical formulary entries. This wave completes the curated
synthetic formulary (D-DATA-001: real generic names, original descriptions, no bundled external
terminology; RxNorm consulted read-only during authoring) toward its final v1 count. **Assumes
OQ-5:** the 150–250 figure is a target band, not a binding floor — roster realism plus plausible
distractor entries decide the count, and the outcome is recorded either way. The formulary is its
own versioned content package (D-DATA-004): id, generic name, class, forms/strengths with
concentration notes, combination components, bidirectional LASA partner refs, high-alert +
time-critical flags, cited monitoring notes, pill-appearance text descriptors, fictional brand
names only. Canonical spec: [appendices/clinical-model.md](appendices/clinical-model.md)
(citation tiers) and [appendices/architecture.md](appendices/architecture.md) (entry schema,
versioning).

## Safety & policy preconditions

- Synthetic-only: descriptions and fictional brand names are original; no proprietary monograph
  text; RxNorm read-only for name/form verification, nothing bundled (D-DATA-001).
- Clinical sign-off (D-EXEC-003): high-alert and time-critical **flags are clinical content** —
  new/changed flags require the owner checkpoint below.
- Harm language (D-SCOR-003): monitoring notes use plausible-consequence phrasing; EP-20 lint
  passes.
- Leak prevention: n/a — no screenshots; login-gated Tier-A sources (e.g., ISMP lists) cited via
  public bibliographic pointer, archives private (integrator resolution I-15).
- Licensing/attribution (D-DATA-006): every flag and monitoring note cites Tier-A/B with version
  + access date; registry rows for consulted sources.
- Accessibility (D-UX-004): pill-appearance text descriptors on every entry (INV-A11Y-001) —
  nonvisual pill cues are a release-gate item.
- Security baseline (D-SEC-001): n/a — content only, no dependencies.

## In scope

1. Reconcile demand: enumerate formulary IDs referenced by all authored/planned case bundles
   (C01–C11) and fix any gaps first (INV-REF-001 clean across the roster).
2. Author distractor entries to a realistic adult general-medicine formulary within the OQ-5
   band: common chronic-disease classes, OTC/supplement entries the interviews need, plausible
   neighbors for the roster's therapeutic classes.
3. Complete LASA coverage: every ISMP-confused-names pair where both partners exist in the
   formulary gets bidirectional `lasaPartners` refs + tall-man flags (INV-REF-002); add partner
   entries where a case-planted LASA hazard needs them.
4. High-alert and time-critical flags per current ISMP lists, each with a Tier-A citation
   (version + access date); cited monitoring notes for flagged classes.
5. Combination products and formulation/strength completeness for roster medications (IR/CR,
   U-100/U-500 concentration notes).
6. Pill-appearance text descriptors for all new entries; fictional brand names screened against
   the registry conventions.
7. Bump the formulary package version; `validate --all` green; record the final count and the
   OQ-5 outcome in the handoff and changelog.

## Out of scope

- Case bundles — EP-26…EP-32 (they add case-critical entries minimally; this EP owns bulk).
- Coverage gating & migrations — EP-34. Roster audit — EP-35.
- Bundled external terminology (RxNorm subsets etc.) — permanently out (D-DATA-001), not parked.

## Owner checkpoints

Owner reviews and signs off on the **flag set** (high-alert, time-critical, LASA additions) —
these feed scoring-relevant case semantics. A short review record in the formulary package
documents it. Count-vs-band outcome (OQ-5) is recorded, and if the owner has ruled OQ-5 by now,
follow the ruling.

## Verification / acceptance

- `validate --all` green incl. INV-REF-001/002 and INV-A11Y-001 across all entries; CI green on
  both OSes.
- Every flag row has ≥1 Tier-A citation with access date *(mechanical via INV-CIT-001 strict)*.
- Formulary version bumped; cases' `formularyVersionRange` still satisfied.
- *(judgement — owner)* flag-set sign-off recorded.

## Handoff

Standard fields + final entry count, OQ-5 outcome recorded, flag-review record path, LASA pair
inventory, and any entries deferred with reasons.

## Parked → final-roadmap.md

none expected; specialty-formulary expansions (transplant, pumps) stay with B-8 (D-RISK-002).
