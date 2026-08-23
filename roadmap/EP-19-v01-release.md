# EP-19 — Picker, pre-brief, about + v0.1 release

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-18 (Workspace, signature & score views), EP-14 (Case C01 exemplar + review) · **Blocks:** EP-36, EP-38 (R3 gates) — R1 ends here; the v0.1 re-plan checkpoint (an ordinary session on roadmap/README.md) follows before R2

## Context

Closes the vertical slice: landing/about with the disclaimer block, case picker, pre-brief with
the review badge (D-RISK-003, D-PED-001), a minimal debrief summary, and the v0.1.0 release
mechanics — tag, Pages deploy verification, first leak-screened screenshots, CLAIMS.md update
(D-UX-006, D-OSS-003, D-QA-002). The Pages deployment *is* the demo (D-UX-006). Surface specs:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) §2 (S-00, S-01, S-02).
Integrator resolution I-17 applied (pre-brief sensitive-content note = brief neutral one-liner;
per-case depth decided at authoring). The full evidence-timeline debrief is **EP-24** — this EP
ships only a summary view that says so.

## Safety & policy preconditions

- Synthetic-only content: all copy from CLAIMS.md canonical blocks; C01 is the only case, and
  it is signed (EP-14 gate) before anything here ships.
- Clinical sign-off (D-EXEC-003): releases and outward claims are owner-only — checkpoint
  below; no case content changes here.
- Harm language (D-SCOR-003): n/a — no new clinical prose; summary view renders authored text.
- Leak prevention: **screenshots are the risk surface** — captured from the live Pages deploy on
  a clean browser profile, metadata-stripped (EP-10 script), and screened for paths, usernames,
  emails, and identifying details against a written checklist before commit.
- Licensing/attribution (D-DATA-006): THIRD-PARTY regenerated (EP-8 script) as part of the tag
  checklist.
- Accessibility (D-UX-004): new surfaces meet the same bar (axe + keyboard); the WCAG *claim*
  stays "designed to meet" (CLAIMS C6) — the conformance claim waits for EP-36/EP-38.
- Security baseline (D-SEC-001): Pages deploys from `main` only via the EP-8 workflow; verify
  before tagging.

## In scope

1. Landing/About (S-00): the standing-disclaimers block verbatim from docs/CLAIMS.md;
   what-this-is / is-not; "physician-reviewed (single reviewer)" limitation prominent; license
   and repo links.
2. Case picker (S-01): tier groupings with recommended-sequence numbers, free navigation
   (D-TAX-004), completion marks (localStorage, graceful when blocked), per-case review-badge
   summary.
3. Pre-brief (S-02): objectives, role framing, synthetic banner, sensitive-content one-liner
   slot (I-17; empty for C01 unless authored), review-status badge — record version + date +
   "single-clinician review" (D-RISK-003) — and Begin.
4. Minimal debrief summary view: post-score recap (subscores + per-discrepancy reveal-card
   list in simple rendering) with an explicit in-UI note that the full evidence-timeline
   debrief is a later release (EP-24); no timeline built here.
5. Re-point the keyboard smoke at real C01: picker → pre-brief → full play → sign → score →
   summary.
6. Release mechanics: CHANGELOG v0.1.0 entry (Keep-a-Changelog, Content category); CLAIMS.md
   sweep — update live numbers (C9: 1 reviewed case) and check every new UI sentence for
   claim-rows; CITATION.cff version bump; THIRD-PARTY regen; annotated tag `v0.1.0` + GitHub
   Release notes.
7. Pages deploy verification: C01 playable end-to-end at the live URL; banner present; keyboard
   spot-check on the deployed build; confirm no non-origin requests in the network panel
   (CLAIMS C7 evidence).
8. First README screenshots per the leak-screen procedure above; replace the EP-2 placeholder.
9. Record the v0.1 re-plan checkpoint instruction in the handoff (resequence R2 if schema churn
   demands — [appendices/risk-register.md](appendices/risk-register.md) R-2).

## Out of scope

- Evidence-timeline debrief → EP-24. Hints UI → EP-25. Phone channel → EP-21.
- Additional cases → EP-26+. Any new outward claim beyond the updated rows → owner-only.

## Owner checkpoints

- **Release gate:** owner reviews the CLAIMS.md diff, the screenshots (leak screen), and the
  release notes, then approves pushing the `v0.1.0` tag (publishing/claims are owner-only,
  D-EXEC-003) *(judgement — owner)*.

## Verification / acceptance

- Tag `v0.1.0` exists; the Pages URL serves the tagged build; C01 completes end-to-end there.
- Full CI green on both OSes including the re-pointed keyboard smoke; axe clean on new states;
  bundle within budget.
- Screenshots committed with the completed leak-screen checklist beside them *(judgement —
  owner confirms)*.
- CLAIMS.md sweep clean (no orphan sentences); CHANGELOG + CITATION.cff updated in the tag
  commit.
- Scoped manual accessibility pass on the release build: keyboard-only plus NVDA run of the
  applicable subset of the 14-step script in appendices/ux-accessibility.md §8 (steps covering
  picker → pre-brief → shell → cite → signature → score), findings fixed or filed; required
  because D-UX-004 mandates a manual keyboard + NVDA pass per release.
- `main` runnable and green at completion.

## Handoff

Standard fields, plus: the live demo URL; the CLAIMS rows touched; re-plan checkpoint notice
(next session should re-read roadmap/README.md §R2 before picking an EP); any schema-churn
findings batched for the re-plan.

## Parked → final-roadmap.md

Anything the release exposed as desirable-but-out-of-scope (e.g., richer picker filtering)
is appended with origin EP-19.
