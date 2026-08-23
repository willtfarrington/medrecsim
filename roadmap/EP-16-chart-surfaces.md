# EP-16 — Chart surfaces v1: chips & citing

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-15 (App shell & accessibility skeleton), EP-9 (Content schema v0 + validator core) · **Blocks:** EP-18 (Workspace, signature & score views), EP-22 (Artifact viewer & source voices), EP-36 (Accessibility gate hardening)

## Context

Builds the chart-side evidence surfaces and the claim-chip interaction model that the whole
product rides on: every piece of evidence decomposes into focusable claim chips that can be
cited forward into the workspace and traced backward to their source (D-UX-001/002; dual
timestamps from D-MED-002 rendered throughout). Surfaces: chart snapshot, imported-meds table
(the stale External Records Exchange list), documents reader, allergies (D-MED-003 — same chip
machinery). Interaction spec: [appendices/ux-accessibility.md](appendices/ux-accessibility.md)
§3 (claim-chip model) and §2 (surfaces S-03a–d). Assumes OQ-6 (one-click "seed working list as
unverified rows" is allowed and scoring-neutral) per
[appendices/open-questions.md](appendices/open-questions.md). Richer source voices
(fax/handwriting/artifacts) are EP-22; this EP renders honest, plain, accessible versions.

## Safety & policy preconditions

- Synthetic-only content: renders schema-validated synthetic bundles only; fixture data follows
  the allowlist convention.
- Clinical sign-off (D-EXEC-003): n/a — no clinical content authored; UI renders authored
  content verbatim.
- Harm language (D-SCOR-003): n/a — no generated prose.
- Leak prevention: no screenshots this EP.
- Licensing/attribution (D-DATA-006): no new assets beyond EP-10 tokens/fonts.
- Accessibility (D-UX-004): true-table semantics, never color-only, popover focus discipline,
  no drag-only interaction (2.5.7), targets ≥24px, real HTML text everywhere (never
  text-in-image).
- Security baseline (D-SEC-001): no runtime network calls; content from compiled JSON only.

## In scope

1. Claim-chip component: every evidence claim a focusable chip exposing status (D-MED-001),
   event time + documentation time, and source; consistent accessible name pattern (validated
   early against NVDA verbosity; record findings).
2. Cite forward: chip → popover with actions (add as new working-list row / attach to existing
   row / attach to a discrepancy / cite to allergy list); focus trapped in popover and restored
   on close; polite announcement on success via the EP-15 announcer; keyboard round-trip ≤2
   activations; never drag-only.
3. Cite backward: a workspace-side chip navigates to, highlights, and focuses the source claim
   (round-trip provenance; full workspace side lands at EP-18 — ship the navigation API now).
4. Contradiction mark: "2 sources disagree" rendered icon + text (never color-only).
5. Imported-meds table (sterile EHR voice: "Received {time} from {org}", staleness badge
   icon + text): true table semantics (caption, `th scope`, `aria-sort`, ≤2 interactive
   elements per row via a row menu); **bulk-cite**: one-click "seed working list as unverified
   rows", once per case, scoring-neutral (OQ-6 assumption).
6. Documents reader for prose sources (discharge summary, outpatient note, filed results):
   formal document voice, heading-based navigation, dual timestamps displayed.
7. Snapshot (minimal ED context) and Allergies surfaces; allergy claims use the same chip +
   cite machinery (D-MED-003).
8. Extend the axe state matrix: popover open, table sorted, contradiction states.

## Out of scope

- Workspace artifacts/rows themselves → EP-18 (this EP ships the cite API + events).
- Artifact viewer, fax/handwriting voices, plain-text toggle → EP-22.
- Phone channel/escalations → EP-21. Interview → EP-17.

## Owner checkpoints

none — technical; if implementation reveals that bulk-cite cannot be scoring-neutral as built,
pause: OQ-6 is owner territory (scoring semantics).

## Verification / acceptance

- Component tests: popover focus trap + restore; cite-forward event payloads; bulk-cite fires
  once per case only.
- Keyboard: chip → cite → back to source round-trip demonstrated in a Playwright spec.
- axe: zero serious/critical on all new states (matrix updated).
- NVDA spot-check note on chip verbosity recorded.
- `main` runnable, CI green both OSes; bundle within budget.

## Handoff

Standard fields, plus: chip accessible-name pattern (EP-17/18/22 reuse it verbatim); cite-event
API for EP-18; NVDA verbosity findings; OQ-6 assumption restated.

## Parked → final-roadmap.md

none
