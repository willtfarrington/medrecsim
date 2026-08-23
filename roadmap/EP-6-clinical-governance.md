# EP-6 — Clinical governance specs: citations & checklists

**Size:** S · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** none · **Blocks:** EP-7 (Discrepancy taxonomy v1), EP-13 (Formulary wave 1)

## Context

Builds the gate instruments every piece of clinical content passes through: the citation format
+ approved-source tiers (D-GOV-002; the charter's approved citation spike), the clinical
self-review checklist and stigma-safety checklist (D-CLIN-001, D-GOV-001, D-GOV-004), and the
review-record template whose badge fields feed the in-app pre-brief badge (D-RISK-003). Nothing
exists yet in the tree for any of these. Detailed specs:
[appendices/clinical-model.md](appendices/clinical-model.md) §5–6 (checklists) and §7 (citation
tiers). Spike SP-3 ([appendices/spikes.md](appendices/spikes.md)) runs inside this EP.
Integrator resolutions applied: I-14 (cite archived NPSG + successor with transition note),
I-15 (login-gated Tier-A sources citable via public bibliographic pointer + private archived
copy in `.local/`, never committed).

## Safety & policy preconditions

- Synthetic-only content: n/a — instruments only, no case content; the checklists themselves
  enforce the rule downstream.
- Clinical sign-off (D-EXEC-003): these instruments define the owner's own review gate — owner
  approval of the instruments is an explicit checkpoint below.
- Harm language (D-SCOR-003): the self-review checklist must include the harm-language audit
  section verbatim-compatible with D-SCOR-003.
- Leak prevention: archived copies of login-gated sources live in `.local/` only (I-15); public
  files carry bibliographic pointers.
- Licensing/attribution (D-DATA-006): sources referenced by the tier list get pointer rows, not
  redistributed content.
- Accessibility (D-UX-004): n/a — docs.
- Security baseline (D-SEC-001): n/a (EP-0 active).

## In scope

1. SP-3: verify the Joint Commission NPSG.03.06.01 successor wording under the 2026 National
   Performance Goals reframing (hospital program); confirm or correct I-14; record the cited
   result (version + access date) in the citation policy.
2. Citation format doc (place under `docs/clinical/` — log the location choice): the YAML
   citation shape `{id, claim, source, publisher, title, version-or-date, url, accessed, tier,
   notes}`; tier definitions — **A** regulatory/safety bodies (FDA/DailyMed, ISMP, TJC, WHO,
   AHRQ, NCC MERP, CDC/NIH incl. clinicalinfo.hiv.gov, SAMHSA), **B** professional-society
   guidelines (ADA, ACC/AHA/CHEST, ASHP, AGS Beers, APA), **C** peer-reviewed literature
   (constructs), **D** tertiary (color only — never sole support for a scored rule); the rule:
   every scored clinical rule cites ≥1 A-or-B source; the I-15 login-gated-source procedure.
3. Clinical self-review checklist v1 (12 sections): truth-layer consistency; clinical
   plausibility; BPMH-process fidelity (≥2 corroborating sources; MARQUIS BPMH domains present
   in menus); high-alert audit vs the current ISMP list + Targeted Best Practices (levodopa
   ±30 min, U-500, anticoagulant escalation-only); LASA audit vs ISMP Confused Drug Names +
   tall-man flags; discrepancy-metadata audit (all five axes, detectability paths, defensible
   ordinals); accepted/unsafe-set audit (full action space classified; no unsafe action
   reachable via an accepted rationale); escalation realism (hours, latency); harm-language
   audit; citation completeness; scope/claims audit; sign-off block (reviewer, credential, date,
   checklist version, content version, disposition) → becomes the public record.
4. Stigma-safety checklist v1 (11 items): person-first language (NIDA Words Matter, APA
   bias-free, AMA style, cited); banned terms (clean/dirty/non-compliant/denies); recurrence not
   relapse-failure framing; systems framing verified for every adherence/access discrepancy; no
   diagnosis-as-identity + non-clinical texture; hook for the roster-level aggregate
   demographic-stereotype audit (executed at EP-35); elder/surrogate/interpreter agency;
   patient-credibility tone; no clinician-cynicism tropes in NPC dialogue; no
   patient-experience claims (D-GOV-004); sign-off.
5. Review-record template with badge fields: record version, review date, "physician-reviewed
   (single reviewer)", checklist versions used, content version reviewed, disposition, re-review
   triggers (annual / issue report / clinical-semantics migration per D-GOV-001).

## Out of scope

- Taxonomy value-sets → EP-7. Schema encoding of citations/badges → EP-9.
- Strict CI enforcement of citation completeness (INV-CIT-001) → EP-20 (warn-level from EP-9).
- Executing the checklists on real content → EP-13/EP-14 and later case EPs.

## Owner checkpoints

- Owner approves both checklists, the tier list, and the review-record template before first
  use — these are the owner's own gate instruments *(judgement — owner)*.

## Verification / acceptance

- The four instruments exist under `docs/clinical/` (or logged alternative), each carrying a
  version number and date.
- Every checklist section/item above is present; the harm-language section quotes the
  D-SCOR-003 rule; the wording "physician-reviewed (single reviewer)" is used throughout.
- SP-3 result recorded with citation + access date; I-14 confirmed or corrected in the policy.
- Template fields cover everything `case.yaml` needs at EP-9 (reviewRecordRef + preBriefBadge).

## Handoff

Standard fields, plus: instrument version numbers; SP-3 outcome; any tier-list source that
moved or went login-only (risk R-6), with the pointer/archive treatment applied.

## Parked → final-roadmap.md

none
