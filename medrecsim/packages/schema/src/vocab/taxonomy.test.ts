// SPDX-License-Identifier: MIT
/**
 * The taxonomy enums are imported VERBATIM from docs/clinical/TAXONOMY.md §8 (owner-approved,
 * spelling-frozen). This test parses the §8 YAML block from the document itself and compares
 * list-vs-list, so a silent edit on either side fails CI.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DETECTABILITIES,
  DISCREPANCY_TYPES,
  MECHANISMS,
  MECHANISM_STRATA,
  REVERSIBILITIES,
  SEVERITIES,
  TIMES_TO_HARM,
  URGENCIES,
  mechanismStratum,
} from './taxonomy.ts';
import { TAXONOMY_VERSION } from '../version.ts';

const DOC = resolve(import.meta.dirname, '../../../../../docs/clinical/TAXONOMY.md');

/**
 * Minimal parser for the §8 block. Line shapes (indent counted in spaces):
 *   `key:` · `key: [a, b]` · `  stratum:` (inside mechanism) · `  - token` · `    - token`.
 */
function parseSection8(markdown: string) {
  const start = markdown.indexOf('## 8. Enum export');
  const block = /```yaml\n([\s\S]*?)```/.exec(markdown.slice(start))?.[1];
  if (!block) throw new Error('§8 yaml block not found');
  const lists: Record<string, string[]> = {};
  const mechanism: Record<string, string[]> = {};
  let key = '';
  let stratum = '';
  let version = '';
  for (const raw of block.split('\n')) {
    const line = raw.replace(/#.*$/, '').trimEnd();
    if (line.trim() === '') continue;
    const indent = line.length - line.trimStart().length;
    const body = line.trim();
    let m: RegExpExecArray | null;
    if ((m = /^taxonomyVersion: "([^"]+)"$/.exec(body))) version = m[1] as string;
    else if ((m = /^(\w+): \[(.*)\]$/.exec(body)))
      lists[m[1] as string] = (m[2] as string).split(',').map((s) => s.trim());
    else if (indent === 0 && (m = /^(\w+):$/.exec(body))) {
      key = m[1] as string;
      if (key !== 'mechanism') lists[key] = [];
    } else if (indent === 2 && key === 'mechanism' && (m = /^([\w-]+):$/.exec(body))) {
      stratum = m[1] as string;
      mechanism[stratum] = [];
    } else if (indent === 4 && key === 'mechanism' && (m = /^- ([\w-]+)$/.exec(body)))
      mechanism[stratum]?.push(m[1] as string);
    else if (indent === 2 && (m = /^- ([\w-]+)$/.exec(body))) lists[key]?.push(m[1] as string);
    else throw new Error(`unparsed §8 line: ${raw}`);
  }
  const list = (k: string) => {
    const v = lists[k];
    if (!v) throw new Error(`§8 list ${k} missing`);
    return v;
  };
  return {
    version,
    type: list('type'),
    mechanism,
    detectability: list('detectability'),
    urgency: list('urgency'),
    severity: list('severity'),
    reversibility: list('reversibility'),
    timeToHarm: list('timeToHarm'),
  };
}

describe('TAXONOMY.md §8 enum export is encoded verbatim', () => {
  const doc = parseSection8(readFileSync(DOC, 'utf8'));

  it('instrument version matches', () => expect(doc.version).toBe(TAXONOMY_VERSION));
  it('type (13)', () => expect([...DISCREPANCY_TYPES]).toEqual(doc.type));
  it('mechanism strata and order (14 in four strata)', () => {
    expect(Object.keys(MECHANISM_STRATA)).toEqual(Object.keys(doc.mechanism));
    for (const [stratum, tokens] of Object.entries(doc.mechanism))
      expect([...MECHANISM_STRATA[stratum as keyof typeof MECHANISM_STRATA]]).toEqual(tokens);
    expect([...MECHANISMS]).toEqual(Object.values(doc.mechanism).flat());
    expect(MECHANISMS).toHaveLength(14);
  });
  it('detectability (7)', () => expect([...DETECTABILITIES]).toEqual(doc.detectability));
  it('urgency / severity / reversibility / timeToHarm', () => {
    expect([...URGENCIES]).toEqual(doc.urgency);
    expect([...SEVERITIES]).toEqual(doc.severity);
    expect([...REVERSIBILITIES]).toEqual(doc.reversibility);
    expect([...TIMES_TO_HARM]).toEqual(doc.timeToHarm);
  });
  it('all tokens are unique and kebab-case or ordinal', () => {
    const all = [
      ...DISCREPANCY_TYPES,
      ...MECHANISMS,
      ...DETECTABILITIES,
      ...URGENCIES,
      ...SEVERITIES,
      ...REVERSIBILITIES,
      ...TIMES_TO_HARM,
    ];
    expect(new Set(all).size).toBe(all.length);
    for (const t of all) expect(t).toMatch(/^(?:[a-z][a-z0-9]*(?:-[a-z0-9]+)*|[US]\d)$/);
  });
  it('mechanismStratum resolves every token', () => {
    expect(mechanismStratum('cost-access-barrier')).toBe('patient-agent-side');
    expect(mechanismStratum('informant-knowledge-limit')).toBe('epistemic');
  });
});
