# EP-10 — Visual identity & originality pack

**Size:** S · **Type:** implementation · **Core/Stretch:** core ·
**Depends on:** EP-3 (Name & identity screening spike), EP-8 (Toolchain bootstrap + ADRs) · **Blocks:** EP-15 (App shell & accessibility skeleton)

## Context

Builds the original visual identity and the originality guard-rails before any UI surface
exists: design tokens, the trade-dress-originality checklist (D-UX-001), the fictional-identity
registry format (integrator resolution I-9: a shared content package beside the formulary), and
the banner/badge component specs (D-UX-006, D-RISK-003). Spikes SP-8 (fonts) and SP-9
(trade-dress dry run) run inside this EP ([appendices/spikes.md](appendices/spikes.md)). Depends
on EP-3's name verdict (fictional names follow the same screening protocol) and EP-8's workspace
(tokens land in `packages/app`). Detailed checklist and registry spec:
[appendices/ux-accessibility.md](appendices/ux-accessibility.md) §10.

## Safety & policy preconditions

- Synthetic-only content: fictional identities must be visibly fictional — 555-01XX phone
  numbers, non-validating NPIs, synthetic MRNs, barcodes that encode "SYNTHETIC".
- Clinical sign-off (D-EXEC-003): n/a — no clinical content; registry names are screened, not
  clinically reviewed.
- Harm language (D-SCOR-003): n/a.
- Leak prevention: SP-9 is **viewing only** — no vendor screenshot, asset, or text ever enters
  the repo; the EXIF/SVG-metadata strip script lands here for all future assets.
- Licensing/attribution (D-DATA-006): fonts must be OFL, self-hosted (a runtime CDN would
  violate D-ARCH-001), license files vendored, THIRD-PARTY + `source material/REGISTRY.md` rows
  added; icons openly-licensed or original.
- Accessibility (D-UX-004): token palette chosen with contrast in mind; handwriting face gets a
  contrast floor and (later, EP-22) a plain-text toggle.
- Security baseline (D-SEC-001): no new dependencies beyond the allowlist without owner sign-off.

## In scope

1. SP-9: trade-dress desk-review dry run — calibrate the checklist against public screenshots of
   3–4 major EHR vendors (viewing only); document ≥3 deliberate composition-level divergences
   for the token design.
2. `docs/ORIGINALITY-CHECKLIST.md`: no vendor coinages or lookalike product names; labels
   descriptive-generic or original (screened per the EP-3 protocol); composition-level
   comparison procedure with documented divergences; never pixel-reference a real EHR; **no
   real-EHR screenshots in this repo, ever**; openly-licensed/original icons only; no reproduced
   EHR/discharge/vendor text.
3. Design tokens in `packages/app`: original documented palette, type scale, spacing —
   tokens only; actual surfaces are EP-15+.
4. SP-8: select OFL document + handwriting faces; verify licenses and self-hosting terms; check
   contrast at authored sizes and bundle weight; vendor the files; add registry + THIRD-PARTY
   rows.
5. Fictional-identity registry (shared content package, I-9): schema from EP-9; seed the
   fictional hospital, pharmacies, clinics, provider names needed by C01; every name screened
   against real organizations and notable persons per the EP-3 protocol (results recorded in
   the registry entries); visibly-fictional identifier conventions documented.
6. Banner + review-badge component specs: banner copy consumed verbatim from docs/CLAIMS.md
   standing disclaimers; badge fields from the EP-6 review-record template ("physician-reviewed
   (single reviewer)" wording).
7. Asset-hygiene script: EXIF strip for images + editor-metadata scrub for SVGs, wired into the
   content pipeline.

## Out of scope

- App shell and any rendered surface → EP-15. Source-voice styling (fax/handwriting rendering)
  → EP-22. Screenshots → EP-19. Registry entries beyond C01's needs → case EPs.

## Owner checkpoints

- Naming: any registry name that screens ≥L2 → owner (D-EXEC-003).
- New font/icon dependencies confirmed against the allowlist *(mechanical unless new)*.

## Verification / acceptance

- Checklist file exists with ≥3 documented divergences (SP-9 output).
- Fonts load from self-hosted files in the built app; license files vendored;
  registry/THIRD-PARTY rows present; no external font/asset URL in the build (grep the dist
  output for third-party origins → zero).
- Registry package passes `validate`; every seeded name carries a screening note.
- Metadata-strip script runs in CI or pre-commit on asset paths (demonstrated on a fixture).
- `main` runnable, CI green.

## Handoff

Standard fields, plus: chosen faces + licenses; the divergence list; registry seed contents;
confirmation nothing vendor-derived entered the tree (SP-9 attestation).

## Parked → final-roadmap.md

none
