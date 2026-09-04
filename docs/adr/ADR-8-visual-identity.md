# ADR-8 — Visual identity: CSS custom-property tokens and two self-hosted OFL variable fonts

**Status:** accepted · **Date:** 2026-09-04 (EP-10) · **Implements:** D-UX-001 (original
visual identity, trade-dress originality), D-UX-002, D-UX-004 (contrast, reduced motion),
D-UX-006, D-ARCH-001 (no runtime network: fonts self-hosted), D-ARCH-007 (budgets), spikes
SP-8 and SP-9 · **Reversibility:** reversible technical choices (D-EXEC-003); swapping a face
or a token value is a normal change with the contrast test as the gate; naming and outward
identity decisions stay owner-only.

## Context

EP-10 lands the identity guard-rails before any surface exists: tokens, fonts, the
originality checklist, the fictional-identity registry and the banner/badge specs. Three
choices needed a record: how tokens are expressed, which typefaces ship and how, and how the
palette is kept honest against WCAG 2.2 AA.

## Decisions

1. **Tokens are plain CSS custom properties** in one file
   (`medrecsim/packages/app/src/styles/tokens.css`), light values on `:root`, dark values under
   `@media (prefers-color-scheme: dark)`, reduced-motion zeroing the durations. No token JSON,
   no build-time transform, no preprocessor, no theme toggle in v1 (the OS setting rules).
   Roles, not hues (`--color-action`, never `--color-teal`).
   *Alternatives:* a design-token JSON compiled by a script (rejected: a second source and a
   build step for a solo project with one consumer); a component-library theme (rejected:
   ADR-5 keeps the runtime dependency list at one package).
2. **A contrast contract is a test.** `tokens.test.ts` parses the CSS, computes WCAG relative
   luminance, and asserts every documented text pair ≥ 4.5:1, non-text pair ≥ 3:1, and the
   handwriting pair ≥ 7:1, in both themes, and that both themes define the same colour set.
   A palette change that breaks the contract fails CI, which is how "chosen with contrast in
   mind" becomes checkable rather than asserted.
3. **Two typefaces, both SIL OFL 1.1, self-hosted as Latin-subset WOFF2 variable fonts:**
   **Atkinson Hyperlegible Next** (document face, `wght` 200–800, 34 KB) and **Caveat**
   (handwriting face for authored artifacts, `wght` 400–700, 77 KB). Fetched from the
   google/fonts repository with upstream commit and hash recorded; subset with fontTools
   keeping all `name` records (copyright, licence text and URL remain inside the font);
   `OFL.txt` vendored beside each; registry and THIRD-PARTY rows added. Loaded by `@font-face`
   with `font-display: swap` and a system fallback on every stack; `font-src 'self'` in the
   CSP forbids any other origin.
   *Alternatives:* system font stack only (rejected: I/l/1 and 0/O distinguishability matters
   for drug names and dose strings, and the handwriting voice needs a real face); a font CDN
   (rejected outright: D-ARCH-001, boundary B7); static instances per weight (rejected: more
   files for less flexibility); Inter / Source Sans 3 / Public Sans for the document face
   (viable, but Atkinson's legibility design is the better fit for the audience and the
   content); Kalam / Patrick Hand / Homemade Apple for handwriting (rejected on stroke
   weight at the minimum size — Caveat's weight axis lets the artifact voice sit at 600).
4. **Handwriting has a floor:** never below 22 px (`--text-handwriting-min`), weight 600,
   ballpoint ink on a paper ground at ≥ 7:1, and (EP-22) a plain-text toggle so that no
   learner depends on the script face at all.
5. **Composition-level divergences are recorded, not implied.** The SP-9 desk review and its
   seven divergences live in `docs/ORIGINALITY-CHECKLIST.md` §2.2; tokens cite the
   divergence they serve (no elevation, small radii, no coloured band, channel hues).

## Consequences

- The initial JS bundle is unchanged (fonts are not JS; tokens are CSS). First paint requests
  one 34 KB font; the 77 KB handwriting face loads only when an artifact uses it.
- `@medrecsim/schema` becomes a **devDependency** of the app so the badge helper can import
  the plain `REVIEW_MODEL` constant from `@medrecsim/schema/vocab`; Vite inlines the constant.
  It is deliberately not a `dependency`: the third-party notices generator lists the app's
  production closure, and `zod` (schema's own dependency) must not appear there as if it
  shipped. ESLint still refuses `zod` imports from the app.
- Adding a colour means adding it to both themes and, if it is a text or border colour, to
  the pair table in the test.
- Any new face or icon set goes through DEPENDENCY-POLICY.md §6, the registry, THIRD-PARTY,
  and this ADR's successor.
