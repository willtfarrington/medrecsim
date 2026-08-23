# EP-15 — App shell & accessibility skeleton

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-8 (Toolchain bootstrap + ADRs), EP-10 (Visual identity & originality pack) · **Blocks:** EP-16 (Chart surfaces v1), EP-17 (Interview v1), EP-36 (Accessibility gate hardening)

## Context

Builds the fictional-EHR shell (D-UX-001) with accessibility as the skeleton, not a retrofit:
landmarks, keyboard model, the single announcer service, settings, and — deliberately —
**200%-zoom reflow behavior is designed here** (D-UX-004; retrofitting reflow later
forces rework). "Fragmentation is fidelity; mechanical friction is not" (D-UX-002); desktop-first
to ~1024px, phones unsupported with a notice (D-UX-003). **Spike SP-6 runs first** (NVDA
live-region behavior in the chosen framework — [appendices/spikes.md](appendices/spikes.md));
the announcer design is confirmed against its findings. IA, regions, and the announcement rules:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) §1 (IA), §2 (screens) and §7
(WCAG plan). Integrator resolutions applied: I-7 (one assertive announcement per authored
threshold crossing), I-8 (mid-case resume is in scope per D-ARCH-005).

## Safety & policy preconditions

- Synthetic-only content: shell renders fixture/placeholder content only; real case content
  arrives via EP-16–EP-18 surfaces.
- Clinical sign-off (D-EXEC-003): n/a — no clinical content.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: no screenshots this EP; CI artifacts contain no local paths.
- Licensing/attribution (D-DATA-006): fonts/tokens from EP-10 only; no new asset sources.
- Accessibility (D-UX-004): this EP is the foundation — landmarks, keyboard operability, focus
  rules, announcer discipline, reduced-motion, no timing-dependent interactions, targets ≥24px.
- Security baseline (D-SEC-001): no runtime network calls (D-ARCH-001); no new deps beyond
  allowlist without owner sign-off.

## In scope

1. **SP-6 first:** verify NVDA live-region behavior for clock/latency announcements (Firefox +
   Chrome) in the chosen framework; confirm or adjust the announcer-service design; record
   findings.
2. Shell layout: three persistent regions as landmarks — source navigation (chart tabs +
   visually distinct "outside the chart" channels), active source viewer, workspace pane
   (collapsible, never loses data) — plus app frame: persistent synthetic/no-affiliation banner
   (EP-10 spec, CLAIMS.md copy), patient header, text-first sim clock ("Sim time: Day 0 · 19:42
   (T0 + 1h 12m)"), reserved Hints slot (consistent placement, WCAG 3.2.6).
3. Keyboard model: 100% operability; pane-cycle shortcut (F6-style) + direct pane shortcuts
   (Alt+1/2/3); skip links; visible focus; focus rules — navigation targets get tabindex="-1"
   focus, focus restored on return, the workspace never steals focus.
4. Single announcer service owning one polite `role="status"` region (+ per-transcript
   `role="log"` later); **assertive reserved for exactly two events**: authored time-critical
   threshold crossings (I-7) and signature validation failure. All live-region writes go
   through the service.
5. **200% zoom/reflow behavior designed and implemented for the shell**: workspace → overlay
   drawer, source nav → menu; only data tables scroll internally; the ≥~1024px floor documented;
   `<1024px` notice surface (D-UX-003).
6. Settings surface: clear-all-local-data control (D-ARCH-005), prefers-reduced-motion
   respected + toggle, hint preferences placeholder. Wire the engine persistence envelope
   (resume in-progress case; polite discard on version mismatch — I-8/I-4).
7. Route skeleton, hash-addressable: Landing → Picker → Pre-brief → Sim shell → Score (stubs
   allowed); browser Back never destroys signed work; in-sim Back intercepted with a confirm.
8. Wire axe into CI for shell states; establish the state-matrix convention (states, not just
   routes) and the versioned exception allowlist file (empty, or justified entries with expiry).

## Out of scope

- Chart surfaces/chips → EP-16. Interview → EP-17. Workspace artifacts/signature/score → EP-18.
- Picker/pre-brief/about content → EP-19. Debrief → EP-24 (SP-7 precedes it).
- Full NVDA manual script → per-release from EP-19; hardened at EP-36.

## Owner checkpoints

none — technical; visual-detail decisions are delegated (charter §7) and logged.

## Verification / acceptance

- axe in CI: zero serious/critical on all shell states; allowlist file empty or justified.
- Minimal Playwright keyboard traversal: land → cycle all three panes → open settings → clear
  data (full smoke lands at EP-18).
- 200% zoom manual check documented (reflow behaviors observed; only tables scroll internally).
- SP-6 findings recorded; announcer service is the only live-region writer (lint/code review
  assertion).
- Bundle within the 300 KB budget; `main` runnable, CI green both OSes.

## Handoff

Standard fields, plus: SP-6 findings + announcer design notes; the reflow design decisions
(EP-16–EP-18 build within them); state-matrix file location; shortcut table (watch for
shortcut collisions).

## Parked → final-roadmap.md

none
