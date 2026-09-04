// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DISCLAIMER } from './disclaimer.ts';

/**
 * The in-app banner must reproduce the canonical block in docs/CLAIMS.md verbatim
 * (RELEASE-CRITERIA per-tag checklist item 2; EP-5 handoff asked for this test).
 */
function canonicalBlockFromClaims(): string {
  const claims = readFileSync(resolve(import.meta.dirname, '../../../../docs/CLAIMS.md'), 'utf8');
  const lines = claims.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith('> Educational use only.'));
  expect(start).toBeGreaterThan(-1);
  const block: string[] = [];
  for (let i = start; i < lines.length && lines[i]?.startsWith('> '); i++) {
    block.push(lines[i]!.slice(2).trim());
  }
  return block.join(' ');
}

describe('standing disclaimer', () => {
  it('is byte-identical to the canonical block in docs/CLAIMS.md', () => {
    expect(DISCLAIMER).toBe(canonicalBlockFromClaims());
  });
});
