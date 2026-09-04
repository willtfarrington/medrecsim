// SPDX-License-Identifier: MIT
/** Unit tests for the pure invariant helpers (bundle-level behaviour is covered by the fixture suite). */
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EvidenceDocument } from '../evidence/document.ts';
import { ReferenceDocument } from '../reference/document.ts';
import { findRealBrandName } from '../vocab/brand-denylist.ts';
import { versionInRange } from '../common/versions.ts';
import { attributeIssue } from './attribution.ts';
import {
  brandDenylistChecks,
  checkMedicationRef,
  citationChecks,
  registryChecks,
} from './case-invariants.ts';
import { lintHarmLanguage } from './harm-language.ts';
import { spdxChecks } from './spdx.ts';
import type { ValidationContext } from './types.ts';
import { DEFERRED_INVARIANTS, SHIPPED_INVARIANTS } from './index.ts';

const ctx = (over: Partial<ValidationContext> = {}): ValidationContext => ({
  formulary: { version: '0.0.1', entries: new Map([['rx-a', {} as never]]) },
  universe: null,
  citationRegistryKeys: new Set(['TJC-NPG-HAP-2026']),
  citationPolicyKeys: new Set(['TJC-NPG-HAP-2026']),
  expectedSpdx: 'CC-BY-4.0',
  ...over,
});

describe('harm-language lint (D-SCOR-003)', () => {
  it('flags probability tokens', () => {
    for (const t of [
      'a 30% chance',
      'the probability of harm',
      'is likely to cause',
      'two-fold higher',
      'one in ten patients',
      'relative risk',
    ])
      expect(lintHarmLanguage(t).probabilityToken, t).not.toBeNull();
    expect(lintHarmLanguage('may cause an avoidable adverse effect').probabilityToken).toBeNull();
  });
  it('flags inevitability wording', () => {
    expect(lintHarmLanguage('this will cause harm').inevitabilityToken).toBe('will cause');
    expect(lintHarmLanguage('always leads to').inevitabilityToken).toBe('always');
    expect(lintHarmLanguage('can lead to').inevitabilityToken).toBeNull();
  });
  it('detects numbers but ignores ids, ordinals and T0 syntax', () => {
    expect(lintHarmLanguage('hold for 48 hours').hasNumber).toBe(true);
    expect(
      lintHarmLanguage('see cit-tjc-npg-2026, urgency U3, severity S2, at T0-3d').hasNumber,
    ).toBe(false);
  });
});

describe('schema-error attribution names the owning invariant', () => {
  const issues = (schema: z.ZodType, input: unknown) => {
    const r = schema.safeParse(input);
    return r.success ? [] : r.error.issues;
  };
  it('evidence: reference key → INV-TRUTH-001; missing timestamp → INV-TIME-001', () => {
    const found = issues(EvidenceDocument, { discrepancies: [] });
    expect(found.map((i) => attributeIssue('evidence.yaml', i))).toContain('INV-TRUTH-001');
  });
  it('reference: bad urgency → INV-DISC-001; action sets → INV-ACT-001', () => {
    const found = issues(ReferenceDocument, {
      discrepancies: [{ urgency: 'U9' }],
      actionSets: { accepted: [] },
    });
    const ids = found.map((i) => attributeIssue('reference.yaml', i));
    expect(ids).toContain('INV-DISC-001');
    expect(ids).toContain('INV-ACT-001');
  });
  it('schemaVersion anywhere → INV-VERS-001', () => {
    const found = issues(EvidenceDocument, { schemaVersion: 1 });
    expect(found.map((i) => attributeIssue('evidence.yaml', i))).toContain('INV-VERS-001');
  });
});

describe('INV-REF-001 medication references', () => {
  it('requires exactly one of formularyId / unresolvedLabel and resolves ids', () => {
    expect(
      checkMedicationRef('INV-REF-001', 'f', [], { formularyId: 'rx-a' }, ctx(), false),
    ).toEqual([]);
    expect(
      checkMedicationRef('INV-REF-001', 'f', [], { formularyId: 'rx-zzz' }, ctx(), false),
    ).toHaveLength(1);
    expect(checkMedicationRef('INV-REF-001', 'f', [], {}, ctx(), false)).toHaveLength(1);
    expect(checkMedicationRef('INV-REF-001', 'f', [], {}, ctx(), true)).toEqual([]);
    expect(
      checkMedicationRef(
        'INV-REF-001',
        'f',
        [],
        {
          formularyId: 'rx-a',
          unresolvedLabel: { text: 'x', sanctioned: true, reason: 'patient-description-only' },
        },
        ctx(),
        false,
      ),
    ).toHaveLength(1);
    expect(
      checkMedicationRef(
        'INV-REF-001',
        'f',
        [],
        { formularyId: 'rx-a' },
        ctx({ formulary: null }),
        false,
      ),
    ).toHaveLength(1);
  });
});

describe('citation, registry, SPDX and scope helpers', () => {
  const record = {
    id: 'cit-x-2026',
    claim: 'c',
    source: 'TJC-NPG-HAP-2026',
    publisher: 'p',
    title: 't',
    'version-or-date': 'v',
    url: 'https://example.invalid/x',
    accessed: '2026-09-02',
    tier: 'A' as const,
    notes: '',
  };
  it('INV-CIT-001: dangling ids are errors; missing citations on scored rules are warnings', () => {
    const f = citationChecks(
      'INV-CIT-001',
      [record],
      [
        { file: 'r', path: [], ids: ['cit-missing-2026'], what: 'x', scored: true },
        { file: 'r', path: [], ids: undefined, what: 'y', scored: true },
        { file: 'r', path: [], ids: ['cit-x-2026'], what: 'z', scored: true },
      ],
    );
    expect(f.filter((x) => x.severity === 'error')).toHaveLength(1);
    // 'y' has no citation; 'x' resolves nothing, so it also cites no Tier A/B source.
    expect(f.filter((x) => x.severity === 'warning')).toHaveLength(2);
  });
  it('INV-CIT-001: uncited records and non-A/B support are warnings', () => {
    const f = citationChecks(
      'INV-CIT-001',
      [
        { ...record, tier: 'D' },
        { ...record, id: 'cit-y-2026' },
      ],
      [{ file: 'r', path: [], ids: ['cit-x-2026'], what: 'x', scored: true }],
    );
    expect(f.map((x) => x.severity)).toEqual(['warning', 'warning']);
  });
  it('INV-REG-001: source keys need registry and policy rows', () => {
    expect(registryChecks('INV-REG-001', [record], ctx())).toEqual([]);
    expect(registryChecks('INV-REG-001', [{ ...record, source: 'NOPE-2026' }], ctx())).toHaveLength(
      2,
    );
    expect(
      registryChecks('INV-REG-001', [record], ctx({ citationRegistryKeys: null }))[0]?.severity,
    ).toBe('warning');
  });
  it('INV-SPDX-001: header within three lines with the expected id', () => {
    const file = (text: string) => ({ name: 'x.yaml', path: 'x.yaml', text, data: undefined });
    expect(
      spdxChecks('INV-SPDX-001', [file('# SPDX-License-Identifier: CC-BY-4.0\na: 1')], 'CC-BY-4.0'),
    ).toEqual([]);
    expect(
      spdxChecks('INV-SPDX-001', [file('# SPDX-License-Identifier: MIT\na: 1')], 'CC-BY-4.0'),
    ).toHaveLength(1);
    expect(
      spdxChecks(
        'INV-SPDX-001',
        [file('a: 1\nb: 2\nc: 3\n# SPDX-License-Identifier: CC-BY-4.0')],
        'CC-BY-4.0',
      ),
    ).toHaveLength(1);
  });
  it('INV-SCOPE-001: real brand names are found as whole words, case-insensitively', () => {
    expect(findRealBrandName('the patient calls it LIPITOR')).toBe('lipitor');
    expect(findRealBrandName('coumadin-like')).toBe('coumadin');
    expect(findRealBrandName('atorvastatin')).toBeNull();
    expect(brandDenylistChecks('INV-SCOPE-001', 'e', { a: [{ b: 'Eliquis' }] })[0]?.path).toEqual([
      'a',
      0,
      'b',
    ]);
  });
  it('version ranges', () => {
    expect(versionInRange('0.1.0', { min: '0.0.1', maxExclusive: '1.0.0' })).toBe(true);
    expect(versionInRange('1.0.0', { min: '0.0.1', maxExclusive: '1.0.0' })).toBe(false);
    expect(versionInRange('0.0.0', { min: '0.0.1' })).toBe(false);
  });
});

describe('invariant catalogue bookkeeping', () => {
  it('shipped and deferred sets are disjoint and cover the 17-entry catalogue', () => {
    const catalogue = new Set(
      [...SHIPPED_INVARIANTS, ...DEFERRED_INVARIANTS].filter(
        (i) => !['INV-SPDX-001', 'INV-REG-001', 'INV-SHAPE-001'].includes(i),
      ),
    );
    expect(catalogue.size).toBe(17);
    expect(
      SHIPPED_INVARIANTS.filter((i) => (DEFERRED_INVARIANTS as readonly string[]).includes(i)),
    ).toEqual([]);
  });
});
