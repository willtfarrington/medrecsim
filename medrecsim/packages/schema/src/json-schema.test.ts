// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { exportJsonSchemas } from './json-schema.ts';
import { CLAIM_STATUSES } from './vocab/claim-status.ts';

describe('JSON Schema export (ADR-2)', () => {
  const all = exportJsonSchemas();
  it('exports one draft-07 document per content file type', () => {
    expect(all.map((s) => s.name)).toEqual([
      'case',
      'evidence',
      'reference',
      'citations',
      'review-record',
      'formulary-manifest',
      'formulary-entry',
      'universe',
    ]);
    for (const s of all) {
      expect(s.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(s.fileMatch.length).toBeGreaterThan(0);
    }
  });
  it('carries the D-MED-001 vocabulary and strictness into the evidence schema', () => {
    const evidence = all.find((s) => s.name === 'evidence')!.schema as {
      additionalProperties?: boolean;
      properties: { claims: { items: { properties: { claimStatus: { enum: string[] } } } } };
    };
    expect(evidence.additionalProperties).toBe(false);
    expect(evidence.properties.claims.items.properties.claimStatus.enum).toEqual([
      ...CLAIM_STATUSES,
    ]);
  });
  it('is deterministic', () => {
    expect(JSON.stringify(exportJsonSchemas())).toBe(JSON.stringify(exportJsonSchemas()));
  });
});
