# ADR-1 — UI framework: Svelte 5

**Status:** accepted · **Date:** 2026-09-04 (EP-8) · **Decides:** D-ARCH-004 (framework choice
delegated to a written ADR) · **Reversibility:** costly after EP-15; the engine seam (D-ARCH-006)
limits the blast radius to `packages/app`.

## Context

D-ARCH-004 delegated the Svelte-vs-React choice to the first implementation session and named
the criteria: accessibility and testing ecosystem maturity, solo maintainability, bundle size,
longevity, owner familiarity (none stated). D-ARCH-007 fixes a public hardware floor (2018-class
laptop, 4 GB RAM, integrated graphics) with an initial JS budget of ≤ ~300 KB gzipped and
interactive < 3 s on floor hardware. The charter requires the choice to be made by measurement
(spike SP-4), not preference.

## Spike SP-4 — bundle floor and throttled timings

**Method.** Two applications with identical markup, CSS, and behaviour: the standing-disclaimer
banner, a simulated-clock control with an `aria-live="polite"` announcer, and a WAI-ARIA Tabs
component (roving tabindex, automatic activation, Arrow/Home/End keys) — one in Svelte 5.57.0
(`@sveltejs/vite-plugin-svelte` 7.3.0), one in React 19.2.8 (`@vitejs/plugin-react` 6.1.1).
Both built with Vite 8.2.2 under an identical configuration (`target: 'es2022'`, no sourcemap,
module-preload polyfill off, relative base). Sizes measured with Node's `zlib` (gzip levels 9
and 6, brotli default). Timings measured with `playwright-core` 1.62.1 driving headless Chrome
stable through the Chrome DevTools Protocol: 4× CPU throttling plus the DevTools "Fast 3G"
network profile (1.6 Mbps down, 750 kbps up, 150 ms RTT), assets served gzip-encoded as GitHub
Pages serves them, a fresh browser context per run, **median of 7 runs**. `app-rendered` is a
`performance.mark` set on the first animation frame after mount. Run on the owner's Windows 11
workstation on 2026-09-04; the spike code lives outside the repository (session scratch space)
and is fully described here.

**Caveat.** 4× CPU throttling on a current desktop is a stand-in for the D-ARCH-007 floor, not a
measurement on it. The release gate G10 ("interactive < 3 s on the floor-hardware profile") is
measured at EP-19/EP-38 on the real application; this table settles only the *relative* cost of
the two frameworks.

| Measure (hello-world + tabs + live region) | Svelte 5.57.0 | React 19.2.8 |
|---|---:|---:|
| Initial JS, raw | 34,996 B | 192,206 B |
| Initial JS, gzip level 9 | **13,919 B** | **59,985 B** |
| Initial JS, gzip level 6 | 13,925 B | 60,098 B |
| Initial JS, brotli | 12,524 B | 51,691 B |
| CSS, gzip 9 | 284 B | 284 B |
| Everything served, gzip 9 | 14,551 B | 60,617 B |
| Share of the 300 KB gz budget (JS) | 4.5 % | 19.5 % |
| Unthrottled `app-rendered` (median) | 39 ms | 31 ms |
| Throttled `domInteractive` | 220 ms | 224 ms |
| Throttled `DOMContentLoaded` | 525 ms | 771 ms |
| Throttled `app-rendered` | **641 ms** | **774 ms** |
| Keyboard check (ArrowRight → "Medications"; End → "Notes"; live region announces) | pass | pass |

Both variants pass the same keyboard and live-region assertions, so the accessible component is
functionally equivalent; the difference is cost.

## Criteria (D-ARCH-004)

| Criterion | Svelte 5 | React 19 | Reading |
|---|---|---|---|
| Bundle size (D-ARCH-007) | 13.9 KB gz floor | 60.0 KB gz floor | Svelte leaves ~46 KB more headroom for the debrief timeline, the chart surfaces, and the accessible widgets that risk R-3 (bundle erosion) worries about. |
| Floor-hardware timing | 641 ms throttled | 774 ms throttled | Both comfortably inside 3 s at hello-world scale; Svelte ahead by ~130 ms before any feature is added. |
| Accessibility ecosystem | Compiler emits a11y warnings at build time (no plugin); `eslint-plugin-svelte` 3.23.0 (2026, ESLint 10 support) | `eslint-plugin-jsx-a11y` 6.10.2 — last published 2024-10, no ESLint 10 peer range at the time of writing | Svelte's checks are built into the toolchain; React's canonical a11y lint is stale against the current ESLint. Neither replaces axe-core (EP-15/EP-36), which is framework-agnostic. |
| Testing ecosystem | `@testing-library/svelte` 5.4.2 (published 2026-08), `svelte-check` 4.7.6, Vitest 5 first-class | `@testing-library/react` 16.3.3 (2026-08), Vitest 5 first-class | Parity for the component tier; the engine tier (D-ARCH-006) is framework-free either way. |
| Longevity | Svelte 5 (runes) stable since 2024-10; single-vendor governance (Vercel-employed core team, MIT) | Largest ecosystem; Meta-governed, MIT | Both acceptable for a complete-at-rest project (D-RISK-005); React's larger ecosystem matters less because runtime dependencies are allowlisted and minimal (D-EXEC-003). |
| Solo / agent maintainability | Single-file components that read as HTML; `$state`/`$derived` map directly onto an engine-owned store (ADR-5) | Hooks discipline, memoisation, and re-render reasoning add review surface for a solo maintainer | Svelte; fewer moving parts per surface. |
| Owner familiarity | none stated | none stated | Neutral (D-ARCH-004). |

## Decision

**Svelte 5** is the UI framework for `packages/app`. React is not adopted. Preact and
framework-free rendering were outside the D-ARCH-004 frame and were not measured.

## Consequences

- Runtime allowlist (DEPENDENCY-POLICY.md §3) seeded with `svelte` 5.57.0 only; it ships
  ~13.9 KB gz at hello-world scale (re-measured by the CI bundle-budget check on every build).
- Toolchain: `@sveltejs/vite-plugin-svelte`, `svelte-check`, `eslint-plugin-svelte`,
  `prettier-plugin-svelte` enter the build/dev register (§4).
- Component tests use Svelte's `mount` under jsdom in Vitest; `@testing-library/svelte` may be
  added at EP-15 if the app shell needs it (dev dependency, agent-addable under the §6 checklist).
- The engine-owned store pattern for Svelte is specified in ADR-5.
- Live-region behaviour under NVDA is framework-sensitive and is verified by spike SP-6 before
  EP-15, as planned.

## Reverified version facts (2026-09-04, npm registry)

Svelte 5.57.0 · `@sveltejs/vite-plugin-svelte` 7.3.0 (peer `vite ^8`) · React 19.2.8 ·
`@vitejs/plugin-react` 6.1.1 · Vite 8.2.2 · Vitest 5.0.0 · `playwright-core` 1.62.1 ·
`@testing-library/svelte` 5.4.2 · `@testing-library/react` 16.3.3 · `eslint-plugin-jsx-a11y`
6.10.2 · `eslint-plugin-svelte` 3.23.0 · `svelte-check` 4.7.6. The planning-time facts
(architecture appendix §8, recorded 2026-08-23) named Svelte 5.56.10, React 19.2.x, Vite 8.0.x,
Vitest 4.1.x — all moved by a patch or minor; nothing changed the decision frame.
