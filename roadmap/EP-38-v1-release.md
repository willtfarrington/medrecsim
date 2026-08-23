# EP-38 — v1.0 release audit & sign-off

**Size:** M · **Type:** governance · **Core/Stretch:** core ·
**Depends on:** everything (EP-0…EP-37; hard gates: EP-35 roster closure, EP-36 accessibility
gate, EP-37 usability) · **Blocks:** none — v1.0 is the terminus

## Context

Executes the twelve-gate v1.0 release criteria — canonical in
[appendices/governance-security.md](appendices/governance-security.md) §7, instantiated as
`docs/RELEASE-CRITERIA.md` at EP-5 — and ships `v1.0.0` (D-OSS-003: first non-0.x tag only when
all criteria pass; D-EXEC-001: R3 → v1.0). The release flips outward claims from softened to
evidenced (D-QA-002), rewrites the README as the honest v1 portfolio narrative, and ends at the
only gate that closes the whole roadmap: **owner sign-off recorded in DECISIONS.md = gate 12**.
Assumes OQ-11: the v1 case-study is a README narrative arc (R0 governance-first → R1 live slice
→ R2 reviewed case gallery → v1 evidenced claims); a standalone case-study doc stays v1.x
(final-roadmap.md B-13). Assumes OQ-12 standing: the owner-approved AI-assisted-authoring
paragraph is already in place from EP-2 — verify, don't author.

## Safety & policy preconditions

- Synthetic-only: final sweep confirms no real data anywhere (gate instruments re-run, registry
  audited).
- Clinical sign-off (D-EXEC-003): no content changes in this EP; releases, claims, and the v1
  declaration itself are owner-only — this session prepares, the owner decides.
- Harm language (D-SCOR-003): README/claims copy re-checked against the rule; no new numbers.
- Leak prevention: **screenshots are taken from the Pages deployment on a clean profile,
  metadata-stripped, and leak-screened** (paths, usernames, emails, EXIF) before inclusion
  (D-UX-006).
- Licensing/attribution (D-DATA-006): THIRD-PARTY regenerated; registry complete; SPDX validated
  in CI (gate 6).
- Accessibility (D-UX-004): gate 3 consumes EP-36's artifacts; any regression re-opens EP-36
  scope before release.
- Security baseline (D-SEC-001/002): gate 5 re-verifies the full checklist; the threat-model
  revisit below.

## In scope

1. Walk `docs/RELEASE-CRITERIA.md` gate by gate, recording evidence links per gate: (1) coverage
   matrix satisfied + committed; (2) every case's public review record + badge; (3) WCAG 2.2 AA
   audit complete (axe green, manual keyboard + NVDA logs, 200%, exceptions published, zero open
   A/AA); (4) claims matrix all evidenced-or-softened, no orphans; (5) security checklist
   re-verified, no open alerts or documented accepted risk; (6) THIRD-PARTY + registry + SPDX;
   (7) screenshots leak-screened from Pages; (8) usability pass done, findings triaged; (9)
   README accurate, quickstart works on a clean machine; (10) full test pyramid green on both
   OSes, goldens pass, ≤300 KB gz, <3 s floor; (11) governance docs current + CITATION bumped;
   (12) owner sign-off in DECISIONS.md.
2. **Claims flip (D-QA-002):** WCAG conformance claim published (EP-36 statement), case counts
   final, deterministic/five-subscore claims pointed at golden evidence; "not yet validated for
   learning outcomes" framing and "physician-reviewed (single reviewer)" wording preserved
   verbatim — these are never flipped.
3. **Threat-model revisit** (D-SEC-002): re-read against the shipped system; date the review;
   confirm the revisit trigger note (any future input-accepting feature) stands.
4. **README v1 rewrite:** narrative arc per OQ-11 assumption; status line replaced with the v1
   statement; what-is/is-not, limitations block pointing at the claims matrix, review-badge
   explanation, quickstart verified clean-machine, screenshots embedded post-screening;
   maintenance-status slot retained (D-RISK-005).
5. Release mechanics: CHANGELOG (Keep-a-Changelog, Content category) finalized; CITATION.cff
   version bump; annotated tag `v1.0.0` + GitHub Release notes; Pages deploy from the tagged
   main; annual re-review reminder instrument confirmed (pinned future-dated issue).
6. Prepare the owner sign-off package: gate-by-gate evidence table for the owner to review and,
   if satisfied, record the dated v1.0 decision entry in DECISIONS.md (**gate 12 — owner writes
   it, not the session**).

## Out of scope

- Fixing substantive gate failures — re-open the owning EP (e.g., a11y regression → EP-36 scope);
  this EP only audits, assembles, and ships.
- Standalone case-study doc — final-roadmap.md B-13 (OQ-11). Learner pilots — B-5.
- Any publishing beyond this repo + Pages, naming changes, or new claims — owner-only
  (D-EXEC-003).

## Owner checkpoints

- README v1 copy and every flipped claim approved before commit (new outward claims are
  owner-only).
- **Gate 12: owner sign-off recorded as a dated entry in DECISIONS.md — the release does not
  exist until this entry does.** Tagging `v1.0.0` happens only after it.

## Verification / acceptance

- All 12 gates marked pass in `docs/RELEASE-CRITERIA.md` with evidence links; gates 1–11
  mechanical/document-backed; gate 12 = the DECISIONS.md entry *(judgement — owner)*.
- `v1.0.0` tag exists; Pages serves the tagged build; CI green on both OSes at the tag.
- Screenshot files pass the leak-screen checklist (recorded per image).
- Claims matrix contains zero softened rows that the release narrative contradicts *(mechanical
  cross-check)*.

## Handoff

Standard fields + the completed criteria document, the DECISIONS.md sign-off entry reference, tag
and release links, and the post-v1 posture note (complete-at-rest per D-RISK-005: annual
re-review reminder set, nothing else scheduled).

## Parked → final-roadmap.md

Anything discovered during the audit that isn't a gate failure (ideas, polish, v1.x candidates)
is parked with a dated entry (D-RISK-002).
