# Design tokens and typefaces (D-UX-001, D-UX-002, D-UX-004; EP-10, spike SP-8)

**Status:** standing — the palette, type scale, spacing and motion vocabulary every surface
from EP-15 onward uses · **Instantiated:** 2026-09-04 (EP-10) · **Source of truth:**
`medrecsim/packages/app/src/styles/tokens.css` (values) and
`medrecsim/packages/app/src/styles/tokens.test.ts` (the contrast contract, run in CI) ·
**Decision record:** [../adr/ADR-8-visual-identity.md](../adr/ADR-8-visual-identity.md) ·
**Originality:** the composition divergences these tokens serve are D-1…D-7 in
[../ORIGINALITY-CHECKLIST.md](../ORIGINALITY-CHECKLIST.md) §2.2.

## 1. Principles

1. **Roles, not hues.** A surface asks for `--color-action`, `--color-channel-phone`,
   `--color-danger-ink`; it never asks for "teal". Renaming a role is a design change; changing
   a hex value is not.
2. **Colour never carries meaning alone** (D-UX-004). Every semantic token comes as a pair
   (`-ink` on `-bg`, optionally `-border`) and is always accompanied by text or an icon.
3. **Contrast is a test, not a promise.** Every pair listed in §2.3 is asserted in both themes
   on every CI run; a value that fails the ratio fails the build.
4. **Fragmentation is fidelity; mechanical friction is not** (D-UX-002). Tokens make the
   controls calm and consistent so that the *content* can be contradictory.
5. **Both themes, no toggle.** Light and dark follow the operating-system setting
   (`prefers-color-scheme`); the two palettes define exactly the same token names.
6. **No raw values in components.** A component that needs a value that is not a token
   proposes a token here first.

## 2. Colour

### 2.1 Light theme

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#f4f1ea` | Page ground: warm paper (divergence D-1: no coloured title band) |
| `--color-surface` | `#fffdf8` | Panes, cards, reading column |
| `--color-surface-raised` | `#ffffff` | Dialogs, menus |
| `--color-surface-sunken` | `#ebe6da` | Inset areas (workspace pane ground) |
| `--color-border` | `#cfc8b8` | Hairlines, dividers |
| `--color-border-strong` | `#7d7563` | Card and chip outlines (≥ 3:1 on canvas and surface) |
| `--color-ink` | `#1e1c18` | Body text |
| `--color-ink-muted` | `#5a554b` | Secondary text (still ≥ 4.5:1) |
| `--color-ink-inverse` | `#fffdf8` | Text on a dark fill |
| `--color-action` / `-hover` | `#0f5f56` / `#0b4a43` | Buttons, interactive affordances |
| `--color-on-action` | `#ffffff` | Text on an action fill |
| `--color-link` | `#0f5f56` | Links (also underlined) |
| `--color-focus` | `#b4500c` | Focus ring (burnt orange; ≥ 3:1 on every ground) |
| `--color-selected-bg` / `-ink` | `#dcefe9` / `#0b4a43` | Selected tab or row |
| `--color-chart-accent` / `-bg` | `#4a3b78` / `#ebe6f5` | Chart tabs (the EHR-like sources) |
| `--color-channel-phone` / `-bg` | `#1f4f8f` / `#e3ebf7` | Phone-call channel (non-chart) |
| `--color-channel-artifact` / `-bg` | `#7a4b12` / `#f6ead6` | Physical-artifact channel (non-chart) |
| `--color-channel-interview` / `-bg` | `#2f6b2f` / `#e2efdd` | Bedside-interview channel (non-chart) |
| `--color-notice-ink` / `-bg` / `-border` | `#2b2100` / `#fff4d6` / `#7a5c00` | The synthetic banner; general notices |
| `--color-danger-ink` / `-bg` / `-border` | `#8f1d1d` / `#fbe4e4` / `#b23a3a` | Unsafe-action surfacing in the debrief |
| `--color-success-ink` / `-bg` | `#1f5f36` / `#dff2e3` | Accepted, verified |
| `--color-info-ink` / `-bg` | `#1f4f8f` / `#e3ebf7` | Informational |
| `--color-stale-ink` / `-bg` | `#7a5c00` / `#fff4d6` | Review badge past its re-review date (amber rule) |
| `--color-paper` / `--color-paper-rule` | `#fbf6e6` / `#d9cfb4` | Authored artifacts: paper ground and ruled lines |
| `--color-handwriting-ink` | `#1c2a6b` | Ballpoint ink for the handwriting face (7:1 floor) |

### 2.2 Dark theme

Same names; values chosen so every §2.3 pair holds. Grounds `#17181a` / `#1f2124` /
`#26292d` / `#111214`; borders `#3d4148` / `#8a9099`; ink `#ebe7dd` / muted `#b3ada0`; action
`#5fc3b4` (hover `#7fd4c7`, on-action `#072622`); focus `#ffb066`; selected `#173a34` /
`#a9e6da`; chart accent `#b7a7ec` / `#2a2440`; channels phone `#8fb4f0` / `#1c2a44`, artifact
`#e0b071` / `#3a2a12`, interview `#94cf8c` / `#1d3320`; notice `#fff4d6` / `#3a2e00` /
`#e0b400`; danger `#ffb3b3` / `#4a1c1e` / `#e07a7a`; success `#9fdcb0` / `#173a25`; info
`#8fb4f0` / `#1c2a44`; stale `#ffd76a` / `#3a2e00`; paper `#2a2d3a` / rule `#474b5e`;
handwriting ink `#c9d2ff`.

### 2.3 The contrast contract (measured 2026-09-04; asserted by `tokens.test.ts`)

| Pair (foreground on background) | Minimum | Light | Dark |
|---|---:|---:|---:|
| ink on canvas / surface | 4.5 | 15.1 / 16.7 | 14.4 / 13.1 |
| ink-muted on canvas / surface | 4.5 | 6.6 / 7.3 | 8.0 / 7.2 |
| action on canvas / surface | 4.5 | 6.7 / 7.4 | 8.4 / 7.7 |
| on-action on action / action-hover | 4.5 | 7.5 / 10.1 | 7.6 / 9.3 |
| link on surface | 4.5 | 7.4 | 9.3 |
| selected-ink on selected-bg | 4.5 | 8.5 | 8.9 |
| chart-accent on canvas / own tint | 4.5 | 8.5 / 7.9 | 8.3 / 6.8 |
| channel-phone on canvas / own tint | 4.5 | 7.2 / 6.8 | 8.4 / 6.8 |
| channel-artifact on canvas / own tint | 4.5 | 6.6 / 6.2 | 9.0 / 7.0 |
| channel-interview on canvas / own tint | 4.5 | 5.7 / 5.4 | 9.8 / 7.5 |
| notice-ink on notice-bg | 4.5 | 14.5 | 12.2 |
| danger-ink on danger-bg | 4.5 | 7.3 | 8.4 |
| success-ink on success-bg | 4.5 | 6.5 | 8.0 |
| info-ink on info-bg | 4.5 | 6.8 | 6.8 |
| stale-ink on stale-bg | 4.5 | 5.7 | 9.7 |
| ink on paper | 4.5 | 15.7 | 11.1 |
| **handwriting-ink on paper** | **7** | 12.2 | 9.2 |
| border-strong on canvas / surface (non-text) | 3 | 4.1 / 4.5 | 5.5 / 4.6 |
| focus on canvas / surface (non-text) | 3 | 4.6 / 5.1 | 9.9 / 9.0 |
| notice-border on notice-bg (non-text) | 3 | 5.7 | 6.8 |
| danger-border on danger-bg (non-text) | 3 | 4.9 | 4.9 |

The focus ring is drawn `--focus-ring-offset` (2 px) outside the control, so the colour it
must contrast with is the ground it floats on, not the control's fill; the test encodes that.

## 3. Typography (SP-8 record)

### 3.1 Faces chosen

| Role | Token | Face | Licence | Axis | Shipped size | Why |
|---|---|---|---|---|---|---|
| Document | `--font-document` | **Atkinson Hyperlegible Next** 2.001 | SIL OFL 1.1 | `wght` 200–800 | 34,080 B (Latin WOFF2) | Designed for low-vision legibility: unambiguous I / l / 1 and 0 / O, open apertures — the letters that matter in drug names and dose strings; one variable file covers every weight; actively maintained (Next release 2025). |
| Handwriting | `--font-handwriting` | **Caveat** 2.000 | SIL OFL 1.1 | `wght` 400–700 | 77,480 B (Latin WOFF2, loaded only when an artifact uses it) | A legible informal script with a weight axis, so the authored "handwritten list" voice can be set at 600 and stay readable; no connected-cursive ambiguity. |
| Monospace | `--font-mono` | system (`ui-monospace`, Cascadia Mono, Consolas, …) | — | — | 0 | Only for ids and code in the about page and debrief; no face shipped. |

Candidates considered and set aside: Inter, Source Sans 3, Public Sans (document — all fine,
none has Atkinson's explicit legibility design); Kalam, Patrick Hand, Homemade Apple
(handwriting — thin strokes or no weight axis at the minimum size). Every stack ends in a
generic family so text renders before and without the web font (`font-display: swap`).

### 3.2 Self-hosting and licence verification

- Both faces were fetched from the google/fonts repository at a recorded commit, with the
  upstream `OFL.txt`, `METADATA.pb` and `upstream_info.md`; SHA-256 of the upstream TTFs and of
  the shipped WOFF2 files, and the exact subset command, are in
  `medrecsim/packages/app/src/assets/fonts/README.md`.
- Neither `OFL.txt` declares a Reserved Font Name, so the family names are kept on the subset
  ("Modified Version") files; the `name` table retains copyright, licence description and
  licence URL; `OFL.txt` is vendored beside each font.
- Rows: `source material/REGISTRY.md` (`FONT-ATKINSON-HYPERLEGIBLE-NEXT`, `FONT-CAVEAT`),
  `THIRD-PARTY.md` "Fonts and visual assets" (with the OFL text), DEPENDENCY-POLICY.md §3a.
- The built `dist/` contains no third-party origin (`scripts/check-no-network.mjs`); the CSP
  says `font-src 'self'`.

### 3.3 Sizes, weights and the handwriting floor

| Token | Value | Use |
|---|---|---|
| `--text-xs` | 13 px | captions, badge metadata (never body text) |
| `--text-sm` | 14 px | dense chart tables, chip labels, badge |
| `--text-md` | 16 px | body |
| `--text-lg` | 18 px | pane titles |
| `--text-xl` | 22 px | section headings; **the handwriting minimum** |
| `--text-2xl` / `--text-3xl` | 28 / 36 px | page, pre-brief and debrief titles |
| `--leading-tight/base/relaxed` | 1.25 / 1.5 / 1.65 | headings / body / long reading |
| `--weight-regular/medium/bold` | 400 / 500 / 700 | Atkinson |
| `--weight-handwriting` | 600 | Caveat |
| `--text-handwriting-min` | 22 px | Caveat is never set below this |

**Handwriting rules (SP-8, D-UX-004):** Caveat only ever renders *authored* artifact text
(handwritten lists, bottle notes) at ≥ 22 px, weight 600, `--color-handwriting-ink` on
`--color-paper` (12.2:1 light, 9.2:1 dark; floor 7:1); it is never used for controls, labels,
or anything the learner must act on; every handwritten artifact also carries its authored
`renderText` transcription, and EP-22 adds a plain-text toggle so no learner depends on the
script face.

## 4. Spacing, shape, focus, motion, layout

| Group | Tokens | Notes |
|---|---|---|
| Spacing | `--space-1…8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px | 4 px base |
| Shape | `--radius-sm/md/lg` = 2 / 4 / 8 px; `--border-width` 1 px, `-strong` 2 px | Flat, bordered surfaces; **no elevation tokens** (divergence D-3); chips are never pill-shaped (D-4) |
| Focus | `--focus-ring-width` 3 px, `--focus-ring-offset` 2 px, `--color-focus` | Global `:focus-visible` rule in `app.css`; WCAG 2.2 focus-appearance |
| Motion | `--duration-fast/base` 120 / 200 ms, `--ease-standard` | Zeroed under `prefers-reduced-motion`; no motion carries information |
| Layout | `--layout-min-width` 64 rem; `--layout-source-pane` 18 rem; `--layout-workspace-pane` 26 rem; `--layout-reading-max` 72ch; `--layout-gutter` | The three-column sim shell (D-UX-001) at ≥ 1024 px (D-UX-003) |
| Stacking | `--z-banner` 10, `--z-dialog` 100 | |

## 5. Changing tokens

- Add a colour to **both** themes and, if it is text or a border, to the pair table in
  `tokens.test.ts` and §2.3 here.
- A new face is a DEPENDENCY-POLICY §6 checklist, an owner checkpoint, registry and notice
  rows, and a successor to ADR-8.
- Naming or identity changes (a new palette "look", a logo) are outward identity and
  owner-only (D-EXEC-003).
