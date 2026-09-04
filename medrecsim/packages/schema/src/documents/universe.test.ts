// SPDX-License-Identifier: MIT
/**
 * Universe-registry rules (EP-10): screening records are required for every non-placeholder
 * entry, identifiers are visibly fictional, and the pure identifier helpers behave.
 */
import { describe, expect, it } from 'vitest';
import { validateUniverse } from '../invariants/validate.ts';
import type { UniverseInput, ValidationContext } from '../invariants/types.ts';
import {
  findRealLookingIdentifiers,
  isFictionalPhone,
  isSyntheticNpi,
  npiCheckDigitValid,
} from '../vocab/synthetic-identifiers.ts';

const ctx: ValidationContext = {
  formulary: null,
  universe: null,
  citationRegistryKeys: null,
  citationPolicyKeys: null,
  expectedSpdx: 'CC-BY-4.0',
};

const screening = {
  date: '2026-09-04',
  venues: ['web', 'rdap', 'uspto-mirror'],
  grade: 'L0',
  note: 'test screen',
};

function input(data: Record<string, unknown>): UniverseInput {
  return {
    kind: 'universe',
    dir: 'content/universe',
    file: {
      name: 'universe.yaml',
      path: 'content/universe/universe.yaml',
      text: '# SPDX-License-Identifier: CC-BY-4.0\n',
      data,
    },
  };
}

function base(): Record<string, unknown> {
  return {
    schemaVersion: '0.1',
    id: 'test-universe',
    universeVersion: '0.1.0',
    locality: { cityName: 'Corrowell', regionText: 'no state named', screening },
    institutions: [
      {
        id: 'inst-hospital',
        name: 'Corrowell General Hospital',
        kind: 'hospital',
        descriptionText: 'The admitting hospital.',
        identifiers: { phone: '555-0100', npi: '0100000001', postalCode: '00010' },
        screening,
      },
    ],
    people: [
      {
        id: 'person-nurse',
        displayName: 'Marcus Lindqvist, RN',
        role: 'admitting nurse',
        institutionId: 'inst-hospital',
        screening,
      },
    ],
  };
}

const errors = (data: Record<string, unknown>) =>
  validateUniverse(input(data), ctx).findings.filter((f) => f.severity === 'error');

describe('synthetic identifier helpers', () => {
  it('recognises the fictional phone range', () => {
    expect(isFictionalPhone('555-0100')).toBe(true);
    expect(isFictionalPhone('555-0199')).toBe(true);
    expect(isFictionalPhone('555-0200')).toBe(false);
    expect(isFictionalPhone('(555) 555-0100')).toBe(false); // authored form is the local part only
  });
  it('computes the NPI check digit and requires synthetic NPIs to fail it', () => {
    expect(npiCheckDigitValid('1234567893')).toBe(true); // the CMS worked example
    expect(npiCheckDigitValid('0400000002')).toBe(true);
    expect(isSyntheticNpi('0400000002')).toBe(false); // leading 0 but valid check digit
    expect(isSyntheticNpi('0100000001')).toBe(true);
    expect(isSyntheticNpi('1100000001')).toBe(false); // leading 1 is a real-looking prefix
  });
  it('finds real-looking phone numbers and NPIs in prose and ignores fictional ones', () => {
    expect(findRealLookingIdentifiers('call (555) 555-0142 or 555-555-0187')).toEqual([]);
    expect(findRealLookingIdentifiers('call (312) 555-9876')).toEqual([
      { kind: 'phone', value: '(312) 555-9876' },
    ]);
    expect(findRealLookingIdentifiers('NPI: 1234567893').map((h) => h.kind)).toEqual(['npi']);
    expect(findRealLookingIdentifiers('NPI 0100000001')).toEqual([]);
    expect(findRealLookingIdentifiers('T0-3d, 2026-01-15, 10-20 mg, SYN-000001')).toEqual([]);
  });
});

describe('validateUniverse (EP-10 rules)', () => {
  it('accepts a screened registry with visibly fictional identifiers', () => {
    expect(errors(base())).toEqual([]);
  });
  it('rejects a non-placeholder entry without a screening record (INV-SCOPE-001)', () => {
    const d = base();
    delete (d.people as Record<string, unknown>[])[0]!.screening;
    const e = errors(d);
    expect(e.map((f) => f.invariant)).toContain('INV-SCOPE-001');
    expect(e[0]?.path).toEqual(['people', 0, 'screening']);
  });
  it('rejects a name screened L2 or L3', () => {
    const d = base();
    (d.institutions as Record<string, unknown>[])[0]!.screening = { ...screening, grade: 'L2' };
    expect(errors(d).some((f) => f.invariant === 'INV-SCOPE-001' && /L2/.test(f.message))).toBe(
      true,
    );
  });
  it('rejects a phone number outside 555-01XX at the schema, attributed to INV-SCOPE-001', () => {
    const d = base();
    (d.institutions as Record<string, unknown>[])[0]!.identifiers = { phone: '555-0200' };
    const e = errors(d);
    expect(e).toHaveLength(1);
    expect(e[0]?.invariant).toBe('INV-SCOPE-001');
    expect(e[0]?.path).toEqual(['institutions', 0, 'identifiers', 'phone']);
  });
  it('rejects an NPI that starts with 0 but passes the check digit (invariant, not schema)', () => {
    const d = base();
    (d.institutions as Record<string, unknown>[])[0]!.identifiers = { npi: '0400000002' };
    const e = errors(d);
    expect(e).toHaveLength(1);
    expect(e[0]?.invariant).toBe('INV-SCOPE-001');
    expect(e[0]?.message).toMatch(/check-digit/);
  });
  it('rejects a real-looking phone number inside prose', () => {
    const d = base();
    (d.institutions as Record<string, unknown>[])[0]!.descriptionText = 'Main line 212-555-1234.';
    expect(errors(d).some((f) => /212-555-1234/.test(f.message))).toBe(true);
  });
  it('warns, not errors, on placeholder entries and requires no screening for them', () => {
    const d = base();
    delete d.locality;
    d.institutions = [
      {
        id: 'inst-x',
        name: 'PLACEHOLDER',
        kind: 'hospital',
        descriptionText: 'PLACEHOLDER',
        placeholder: true,
      },
    ];
    d.people = [];
    const r = validateUniverse(input(d), ctx);
    expect(r.findings.filter((f) => f.severity === 'error')).toEqual([]);
    expect(r.findings.some((f) => f.severity === 'warning' && /placeholder/.test(f.message))).toBe(
      true,
    );
  });
  it('rejects a person whose institutionId is not in the registry (INV-SHAPE-001)', () => {
    const d = base();
    (d.people as Record<string, unknown>[])[0]!.institutionId = 'inst-nowhere';
    expect(errors(d).some((f) => f.invariant === 'INV-SHAPE-001')).toBe(true);
  });
});
