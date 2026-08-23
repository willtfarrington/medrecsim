# EP-24 — Evidence-timeline debrief

**Size:** L · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-18 (Workspace, signature & score views), EP-12 (Engine scoring, signature,
debrief data + golden harness) · **Blocks:** EP-36 (Accessibility gate hardening), EP-38 (v1.0
release audit & sign-off)

## Context

The debrief is the pedagogical centerpiece (D-PED-002): a what-was-knowable-when timeline, the
learner's path overlaid on the reference, per-discrepancy reveal cards (classification, ordinal
labels, mechanism, cited teaching note), uncertainty rationale, and targeted-replay pointers.
EP-12 already produces the golden-locked debrief data contract (event log + knowable-when
derivation: earliest-knowable vs accessed vs logged triples); EP-19 shipped only a minimal
summary. This EP builds the full surface. It is the hardest accessibility surface in the app
(risk R-4): the design is dual-view — an accessible table as the conformance surface plus a
keyboard-navigable SVG with focusable nodes. **SP-7 (debrief timeline accessibility prototype)
runs first and decides the SVG technique before any build.** Canonical specs:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) (timeline design, dual views) and
[appendices/clinical-model.md](appendices/clinical-model.md) (debrief data contract, reveal-card
content model). Assumes OQ-7: targeted replay is an **unscored replay mode** (replay banner, no
signature scoring) — re-scoring is an owner-only semantics change.

## Safety & policy preconditions

- Synthetic-only: renders authored case data only.
- Clinical sign-off (D-EXEC-003): n/a for this EP — reveal-card *content* lives in owner-gated
  case bundles; this EP must render citations wherever teaching notes appear (D-RISK-003).
- Harm language (D-SCOR-003): the surface renders authored mechanism-of-harm text verbatim;
  chrome copy introduces no probability or severity language of its own.
- Leak prevention: n/a — no screenshots this EP.
- Licensing/attribution (D-DATA-006): n/a — no new assets.
- Accessibility (D-UX-004): per-slice DoD below; table view is the conformance surface; no
  color-only encoding (shapes + text on the timeline).
- Security baseline (D-SEC-001): no new runtime dependencies without the allowlist process.

## In scope

1. **SP-7 spike first:** ~20-event dual-view prototype; NVDA browse/focus behavior in Firefox +
   Chrome; SVG-native vs HTML-overlay node technique; record the technique decision. If the
   prototype fails NVDA expectations, ship the table as primary with a simplified visual timeline
   (risk R-4 contingency) and document it.
2. Timeline, dual views: accessible table (sortable, keyboard-first, the WCAG conformance
   surface) + SVG visualization with focusable, labeled nodes; both driven by the same
   engine-derived knowable-when data — the timeline is computed, never authored.
3. Learner-path vs reference overlay: earliest-knowable / accessed / logged triple per evidence
   unit as the overlay spine.
4. Per-discrepancy reveal cards: classification vs accepted set, five-axis metadata, ordinal
   severity/reversibility/time-to-harm labels (never numbers), causal mechanism, cited teaching
   note with citations always rendered (D-RISK-003); unsafe actions surfaced prominently with
   mechanism-of-harm cards (D-SCOR-002).
5. Uncertainty rationale display for irreducible items (D-MED-005) — "unable to verify" honored
   as correct where authored.
6. Hint display: neutral annotations + support-summary panel; hint use never rendered negatively
   (no negative color/icon; D-PED-001).
7. Targeted-replay pointers launching unscored replay at authored checkpoints (OQ-7 assumption);
   replay banner visible; completion marks untouched.
8. Clock events (e.g., a fired time-critical trigger) rendered on the timeline.
9. Per-slice DoD: axe serious/critical = 0 on new surfaces incl. an open reveal card; keyboard-only
   demo of both views; live-region writes only via the announcer service; plain-language copy review.

## Out of scope

- Scoring computation changes — engine/EP-12, owner-gated goldens (OQ-8).
- Hints authoring UI — EP-25 owns the in-sim hint surface.
- Session export of debrief — final-roadmap.md B-4.

## Owner checkpoints

none unless SP-7 forces a design retreat that changes an outward accessibility claim — then pause
and present *(judgement — owner)*.

## Verification / acceptance

- SP-7 result recorded (technique decision + NVDA notes) before build commits.
- Golden debrief data renders correctly for C01 and available R2 cases; snapshot tests on the
  view-model transform.
- Table view passes keyboard-only Playwright flow; axe serious/critical = 0 across the debrief
  state matrix (incl. reveal card open).
- Bundle budget green — debrief may be its own lazy chunk (risk R-3 mitigation).
- CI green on both OSes; `main` runnable.

## Handoff

Standard fields + SP-7 decision record, the state-matrix entries added to the axe run, and any
R-4 contingency taken.

## Parked → final-roadmap.md

none expected; richer replay (arbitrary rewind) and export ideas are parked (D-RISK-002).
