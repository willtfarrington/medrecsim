// SPDX-License-Identifier: MIT
/**
 * Contrast contract for the design tokens (EP-10; D-UX-004). The pairs below are the ones
 * docs/design/DESIGN-TOKENS.md declares as text-on-background (≥ 4.5:1), non-text (≥ 3:1), or
 * the handwriting pair (≥ 7:1 floor, SP-8). Both themes are checked; a token that exists in
 * one theme must exist in the other.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8');

function tokensIn(block: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const m of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g))
    out.set(m[1] as string, (m[2] as string).trim());
  return out;
}

const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
const darkEnd = css.indexOf('@media (prefers-reduced-motion');
const light = tokensIn(css.slice(0, darkStart));
const dark = tokensIn(css.slice(darkStart, darkEnd));

function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`not a 6-digit hex colour: ${hex}`);
  const n = parseInt(m[1] as string, 16);
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** [foreground, background, minimum ratio] — the documented contract. */
const PAIRS: readonly [string, string, number][] = [
  // body text on grounds
  ['--color-ink', '--color-canvas', 4.5],
  ['--color-ink', '--color-surface', 4.5],
  ['--color-ink', '--color-surface-raised', 4.5],
  ['--color-ink', '--color-surface-sunken', 4.5],
  ['--color-ink-muted', '--color-canvas', 4.5],
  ['--color-ink-muted', '--color-surface', 4.5],
  ['--color-ink-inverse', '--color-action', 4.5],
  // interaction
  ['--color-action', '--color-canvas', 4.5],
  ['--color-action', '--color-surface', 4.5],
  ['--color-action-hover', '--color-surface', 4.5],
  ['--color-on-action', '--color-action', 4.5],
  ['--color-on-action', '--color-action-hover', 4.5],
  ['--color-link', '--color-surface', 4.5],
  ['--color-link', '--color-canvas', 4.5],
  ['--color-selected-ink', '--color-selected-bg', 4.5],
  // chart accent and the three non-chart channels, as text on canvas and on their own tint
  ['--color-chart-accent', '--color-canvas', 4.5],
  ['--color-chart-accent', '--color-chart-accent-bg', 4.5],
  ['--color-channel-phone', '--color-canvas', 4.5],
  ['--color-channel-phone', '--color-channel-phone-bg', 4.5],
  ['--color-channel-artifact', '--color-canvas', 4.5],
  ['--color-channel-artifact', '--color-channel-artifact-bg', 4.5],
  ['--color-channel-interview', '--color-canvas', 4.5],
  ['--color-channel-interview', '--color-channel-interview-bg', 4.5],
  // semantic states
  ['--color-notice-ink', '--color-notice-bg', 4.5],
  ['--color-danger-ink', '--color-danger-bg', 4.5],
  ['--color-success-ink', '--color-success-bg', 4.5],
  ['--color-info-ink', '--color-info-bg', 4.5],
  ['--color-stale-ink', '--color-stale-bg', 4.5],
  // artifacts: plain ink on paper, and the handwriting floor
  ['--color-ink', '--color-paper', 4.5],
  ['--color-handwriting-ink', '--color-paper', 7],
  // non-text: borders, focus ring, state borders (≥ 3:1 against what they sit on). The focus
  // ring is drawn with --focus-ring-offset outside the control, so its neighbour is the
  // surface or canvas it floats on, never the control's own fill.
  ['--color-border-strong', '--color-canvas', 3],
  ['--color-border-strong', '--color-surface', 3],
  ['--color-focus', '--color-canvas', 3],
  ['--color-focus', '--color-surface', 3],
  ['--color-focus', '--color-surface-raised', 3],
  ['--color-notice-border', '--color-notice-bg', 3],
  ['--color-danger-border', '--color-danger-bg', 3],
  ['--color-paper-rule', '--color-paper', 1.2],
];

describe('design tokens: contrast contract (D-UX-004)', () => {
  it('defines the same colour tokens in both themes', () => {
    const lightColours = [...light.keys()].filter((k) => k.startsWith('--color-')).sort();
    const darkColours = [...dark.keys()].filter((k) => k.startsWith('--color-')).sort();
    expect(darkColours).toEqual(lightColours);
  });

  for (const [theme, tokens] of [
    ['light', light],
    ['dark', dark],
  ] as const) {
    describe(theme, () => {
      for (const [fg, bg, min] of PAIRS) {
        it(`${fg} on ${bg} ≥ ${min}:1`, () => {
          const a = tokens.get(fg);
          const b = tokens.get(bg);
          expect(a, fg).toBeDefined();
          expect(b, bg).toBeDefined();
          const ratio = contrast(a as string, b as string);
          expect(
            ratio,
            `${theme}: ${fg} ${a} on ${bg} ${b} = ${ratio.toFixed(2)}:1`,
          ).toBeGreaterThanOrEqual(min);
        });
      }
    });
  }

  it('sets the handwriting minimum size at or above 22 px and the focus ring at 3 px', () => {
    expect(parseFloat(light.get('--text-handwriting-min') ?? '0') * 16).toBeGreaterThanOrEqual(22);
    expect(light.get('--focus-ring-width')).toBe('3px');
  });

  it('names a system fallback in every font stack', () => {
    for (const k of ['--font-document', '--font-handwriting', '--font-mono']) {
      const stack = light.get(k) ?? '';
      expect(stack.split(',').length, k).toBeGreaterThan(1);
      expect(/(sans-serif|cursive|monospace)$/.test(stack), k).toBe(true);
    }
  });
});
