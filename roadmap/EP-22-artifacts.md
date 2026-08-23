# EP-22 — Artifact viewer & source voices

**Size:** M · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-16 (Chart surfaces v1: chips & citing) · **Blocks:** EP-31 (Case C10 —
insulin/surrogate), EP-36 (Accessibility gate hardening)

## Context

Implements physical-artifact evidence (bottles, pillboxes, paper lists — D-WF-001 source 3) and
the distinct "source voices" that make fragmentation legible without mechanical friction
(D-UX-002): fax/printout pharmacy history, handwritten lists, letterhead documents. Every voice
is real HTML text, never text-in-image; synthetic images are secondary to first-class structured
transcriptions and authored pill-appearance text descriptors (D-UX-004 nonvisual cues,
INV-A11Y-001). EP-16 shipped claim chips and the cite popover this viewer plugs into. Canonical
spec: [appendices/ux-accessibility.md](appendices/ux-accessibility.md) (artifact surface, voice
inventory, banned dark patterns); visual identity constraints from the EP-10 originality pack.

## Safety & policy preconditions

- Synthetic-only: all artifact images and label content are generated/original; fictional
  institutions from the shared registry; visibly fictional identifiers; barcodes, if any, encode
  SYNTHETIC.
- Clinical sign-off (D-EXEC-003): n/a — artifact *content* stays in case bundles owned by case
  EPs; this EP renders authored data only.
- Harm language (D-SCOR-003): n/a — no teaching text authored.
- Leak prevention: EXIF/metadata strip is scripted in the content pipeline for every image asset;
  SVG editor metadata scrubbed; nothing sourced from real photos of real medications' trade dress.
- Licensing/attribution (D-DATA-006): fonts (incl. any handwriting face from the EP-10 spike) are
  self-hosted, license-verified, with THIRD-PARTY + registry rows; runtime CDN fonts would
  violate D-ARCH-001.
- Accessibility (D-UX-004): per-slice DoD below; decorative scan edges aria-hidden; handwriting
  face meets the contrast floor with a plain-text toggle.
- Security baseline (D-SEC-001): no new runtime dependencies without the allowlist process.

## In scope

1. Artifact gallery + detail views: per-artifact kind, examine cost (advances sim clock, cost in
   the control's accessible name), synthetic image with alt text.
2. First-class structured transcription pane per artifact: label fields (drug, strength,
   directions, fill date, quantity, pharmacy) as claim chips, citable via the EP-16 popover; pill
   descriptors rendered as text.
3. Source voices: pharmacy dispensing history as monospace fax/printout with fictional
   letterhead; handwritten list with handwriting face, lined-paper styling, `<del>` +
   "(crossed out)" semantics, and a plain-text toggle; formal document voice for
   discharge/outpatient notes refined with heading navigation. Decorative CSS (scan edges,
   texture) aria-hidden.
4. Contradiction affordance carried through: "2 sources disagree" marks render text + visual on
   artifact-derived claims.
5. No banned patterns: no fake spinners/logins/pagination, no buried tabs, no real-time waits.
6. Per-slice DoD: axe serious/critical = 0 on new surfaces; keyboard-only demo (open artifact →
   read transcription → cite a label claim); live-region writes only via the announcer service;
   plain-language copy review.

## Out of scope

- Case bundles containing decisive artifacts (e.g., C10's EMS-bagged vials) — EP-31 and other
  case EPs.
- Interview modes — EP-23. Debrief rendering — EP-24.
- Any image-generation tooling beyond what the content pipeline already scripts — park if larger.

## Owner checkpoints

none — visual detail is delegated (charter §7); trade-dress originality checklist findings that
are not clear-cut go to the owner rather than being self-approved *(judgement — owner, only if
triggered)*.

## Verification / acceptance

- Component tests for transcription/chip decomposition and the plain-text toggle.
- Trade-dress originality checklist run against the new voices; result recorded.
- Metadata-strip script demonstrated on at least one image asset (before/after).
- axe serious/critical = 0 on new surfaces; keyboard-only Playwright smoke extended to an
  artifact examine-and-cite path; bundle budget green (images lazy-loaded).
- CI green on both OSes; `main` runnable.

## Handoff

Standard fields + the voice inventory implemented, registry/THIRD-PARTY rows added, and the
metadata-strip evidence.

## Parked → final-roadmap.md

none expected; richer artifact interactions (zoom/rotate viewers, etc.) are parked per D-RISK-002.
