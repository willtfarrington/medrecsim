# Component specs: synthetic banner and review badge (D-UX-006, D-RISK-003; EP-10)

**Status:** standing contracts for EP-15 (app shell renders the banner from these rules) and
EP-19 (pre-brief and picker render the badge) · **Instantiated:** 2026-09-04 (EP-10) ·
**Copy sources:** the banner text is the canonical block in [../CLAIMS.md](../CLAIMS.md)
(owner-only to change); the badge fields are §2 of
[../clinical/REVIEW-RECORD-TEMPLATE.md](../clinical/REVIEW-RECORD-TEMPLATE.md) (owner-only to
change) · **Tokens:** [DESIGN-TOKENS.md](DESIGN-TOKENS.md).

Both components exist to keep the project honest in the interface itself: the banner says
what this is and is not on every page; the badge says how and when each case was reviewed.
Neither may be softened, restyled into invisibility, or made dismissible.

## 1. Synthetic / no-affiliation banner

**Copy.** Two strings, both fixed:

| Part | Source | Rule |
|---|---|---|
| Lead line | `BANNER_LEAD` in `medrecsim/packages/app/src/disclaimer.ts`: *Fictional, synthetic simulation for educational use only.* | Claim-free wording; changing it is an outward-copy edit (owner decision). |
| Body | `medrecsim/packages/app/src/disclaimer.json` — the standing-disclaimer block of CLAIMS.md **verbatim** (same words, same punctuation) | Byte-equality is asserted by `disclaimer.test.ts` and by `scripts/check-claims.mjs` in CI. Any change is an owner decision recorded in DECISIONS.md and propagated to every consumer in one commit. |

**Structure and placement.**

- A `<section>` landmark labelled by its lead line (`aria-labelledby`), rendered **before**
  `<main>` on every page, including the case picker, the pre-brief, the sim shell, the debrief,
  and the about page. It is the first thing after the skip link.
- Never dismissible, never collapsed, never behind a "more" control. It scrolls with the page
  (not position-fixed) so that it never covers content at 200 % zoom or on a 1024 px viewport.
- Inside the sim shell it sits above the three-column layout, full width, and stays in the
  document order so screen-reader users meet it once per page load and can jump past it by
  landmark.

**Tokens.** `--color-notice-bg` / `--color-notice-ink` / `--color-notice-border` (both themes
≥ 4.5:1 text, ≥ 3:1 border); padding `--space-3 --space-4`; lead at `--text-md` /
`--weight-bold`; body at `--text-sm`, max 80ch; border `--border-width-strong` on the bottom
edge only. No icon is required; if one is added it is decorative (`aria-hidden`).

**Accessibility.** Text conveys everything (no colour-only meaning); contrast checked by
`tokens.test.ts`; reflows at 200 % zoom; no animation. The lead line is a heading so the
banner appears in heading navigation; EP-15 may lower its level to keep the page outline
sensible but must keep it a heading.

**Reference implementation.** `medrecsim/packages/app/src/Banner.svelte` (EP-8, retokenised
at EP-10) already satisfies this spec and is what EP-15 lifts into the shell.

## 2. Review badge

**Fields** (from `case.yaml` `preBriefBadge`, copied from `review-record.yaml`; `INV-META-001`
checks they agree):

| Field | Value | Notes |
|---|---|---|
| `label` | `physician-reviewed (single reviewer)` — fixed | The only permitted review descriptor (CLAIMS.md C3). The helper throws on any other string. |
| `recordVersion` | integer | Bumps with every new review of the bundle. |
| `reviewDate` | ISO `YYYY-MM-DD` | The review date. |
| `staleAfter` | ISO `YYYY-MM-DD` = `reReview.dueBy` | Review date + 12 months (D-GOV-001 annual re-review). |

**Text.** Produced by `reviewBadge(fields, viewingDate)` in
`medrecsim/packages/app/src/identity/review-badge.ts` (pure; tested):

> physician-reviewed (single reviewer) · record v1 · reviewed 2026-11-15

and, when `viewingDate > staleAfter` (the day after the due date onward):

> physician-reviewed (single reviewer) · record v1 · reviewed 2026-11-15 · re-review due

`viewingDate` is the viewer's local calendar day, obtained by the **app adapter** from the
browser clock. It is never read inside the engine (D-ARCH-006: engine code is clock-free) and
never affects scoring or play; the case stays fully playable when stale (D-RISK-005).

**Amber rule.** The stale state adds the words "re-review due" **and** switches the badge to
the `--color-stale-*` tokens; the words carry the meaning, the colour reinforces it (D-UX-004).
No other state exists in v1: a case without a review record is `draft-unreviewed` and is
excluded from the compiled content (ADR-3), so the badge never has to say "unreviewed".

**Placement.**

- **Pre-brief** (EP-19): directly under the case title, before the objectives, as an inline
  element with `aria-label` = the full text. Links (in-app) to the rendered public review
  record and to the case changelog (REVIEW-RECORD-TEMPLATE §2).
- **Case picker** (EP-15/19): the same text in the summary row of every case, at `--text-sm`;
  the picker may abbreviate nothing.
- **Debrief** (EP-24): repeated in the footer of the teaching notes beside the citations.

**Tokens.** Current: `--color-surface` ground, `--color-border-strong` outline
(`--border-width`), `--color-ink` text, `--radius-md`, padding `--space-1 --space-2`, text
`--text-sm`, separator "·" with `--space-2` around it. Stale: `--color-stale-bg` /
`--color-stale-ink` with the same outline. Never pill-shaped (originality divergence D-4).

**Accessibility.** One accessible name for the whole badge (`ariaLabel`), so a screen reader
reads it as one phrase; the parts array lets a surface wrap each span for styling without
changing the reading order. Minimum text size `--text-sm`; contrast pairs are in the token
contract.

## 3. Shared rules for both

- Keyboard: neither component traps focus; the badge's links are ordinary links with visible
  focus rings (`--focus-ring-width`, `--color-focus`).
- Motion: none.
- Copy discipline: both consume their strings from the single sources named above; no surface
  re-types them.
- Testing: `disclaimer.test.ts` and `review-badge.test.ts` are the contracts; EP-15/19
  component tests assert the DOM shape described here, and the Playwright keyboard smoke
  (EP-18) asserts the banner is present on every route.
