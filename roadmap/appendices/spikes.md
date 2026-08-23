# Spike backlog

Bounded evidence spikes: empirical unknowns that must not be settled by preference (charter §7).
Each has an owner (the session executing the named EP), inputs, output artifact, an effort box
(all ≤ half a session unless noted), and exit criteria. Results are cited with version/access
date; anything time-sensitive is re-verified at execution (D-RISK-006).

| ID | Spike | Runs inside | Output / exit criteria |
|---|---|---|---|
| SP-1 | Clozapine REMS current state: post-2023 program status and exact interruption-retitration threshold wording from current label/REMS | EP-32 (before authoring) | Cited rule text with access date; C11 unsafe/accepted sets authored against it |
| SP-2 | SAMHSA 42 CFR Part 8 current text: OTP dose-verification and interim-dosing ("72-hour") rules relevant to C08 | EP-29 (before authoring) | Cited rule summary; C08 escalation/latency and accepted sets authored against it |
| SP-3 | Joint Commission NPSG.03.06.01 successor wording under the 2026 National Performance Goals reframing (hospital program) | EP-6 | Citation policy note: cite archived NPSG + successor with transition note (integrator resolution I-14) confirmed or corrected |
| SP-4 | Bundle floor measurement: hello-world + one representative component in Svelte 5 and React 19 under identical Vite config; gz sizes + throttled 2018-class profile timings | EP-8 (feeds ADR-1) | Measured table in the ADR; framework chosen against D-ARCH-004 criteria |
| SP-5 | Schema-lib authoring ergonomics: yaml-language-server `$schema` autocomplete against exported JSON Schema; Zod 4 `z.toJSONSchema` fidelity for the claim schema | EP-8 (feeds ADR-2) | Working autocomplete demo or documented failure; validation-lib chosen |
| SP-6 | NVDA live-region behavior for clock/latency announcements in the chosen framework (Firefox + Chrome) | Before EP-15 | Announcement pattern verified; announcer-service design confirmed |
| SP-7 | Debrief timeline accessibility prototype: 20-event dual-view (table + SVG) timeline; NVDA browse/focus behavior; SVG-native vs HTML-overlay node technique | Before EP-24 | Technique decision recorded; EP-24 builds the winner |
| SP-8 | Font selection: OFL document + handwriting faces; contrast at authored sizes, bundle weight, self-hosting license terms | EP-10 | Faces chosen, licenses verified, registry rows added |
| SP-9 | Trade-dress desk-review dry run: calibrate the originality checklist against public screenshots of 3–4 major EHR vendors (viewing only; nothing copied into the repo) | EP-10 | Checklist calibrated; ≥3 deliberate divergences documented for the design tokens |
| SP-10 | USPTO trademark search completion (programmatic query was inconclusive at planning time; GitHub/npm/PyPI/domains already screened clear on 2026-08-23) | EP-3 | NAME-SCREEN.md verdict with all six venues; owner ruling if ≥L2 collision |

Closed at planning time: preliminary name screen (2026-08-23; all venues clear except USPTO —
see [governance-security.md](governance-security.md) §8); current-version checks for the
candidate toolchain (recorded in [architecture.md](architecture.md); re-verify at EP-8).
