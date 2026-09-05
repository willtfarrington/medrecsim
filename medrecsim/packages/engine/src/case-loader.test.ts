// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { CaseLoadError, loadCompiledCase } from './case-loader.ts';
import { EXEMPLAR_CASE_ID, exemplarChunk } from './test-support/exemplar.ts';

function chunk(): Record<string, unknown> {
  return structuredClone(exemplarChunk()) as Record<string, unknown>;
}

function codeOf(fn: () => unknown): string {
  try {
    fn();
  } catch (e) {
    if (e instanceof CaseLoadError) return e.code;
    throw e;
  }
  return 'loaded';
}

describe('loadCompiledCase', () => {
  it('loads the compiled exemplar with its case-local offset', () => {
    const c = loadCompiledCase(chunk());
    expect(c.case.id).toBe(EXEMPLAR_CASE_ID);
    expect(c.evidence.caseId).toBe(EXEMPLAR_CASE_ID);
    expect(c.reference.caseId).toBe(EXEMPLAR_CASE_ID);
    // Authored T0 was 14:30 at -05:00 (compiled to 19:30Z); the offset survives compile.
    expect(c.caseLocalUtcOffsetMinutes).toBe(-300);
    expect(c.evidence.T0).toBe('2026-01-15T19:30:00Z');
    expect(c.compiledFrom).toBe('medrecsim/content/cases/_exemplar');
    expect(c.reviewRecord).toBeNull();
  });

  it('refuses a non-object', () => {
    expect(codeOf(() => loadCompiledCase('nope'))).toBe('not-an-object');
    expect(codeOf(() => loadCompiledCase(null))).toBe('not-an-object');
  });

  it('refuses a chunk missing a section', () => {
    for (const section of ['case', 'evidence', 'reference', 'citations']) {
      const c = chunk();
      delete c[section];
      expect(
        codeOf(() => loadCompiledCase(c)),
        section,
      ).toBe('missing-section');
    }
  });

  it('refuses a chunk without the compile-time offset (pre-EP-11 compile output)', () => {
    const c = chunk();
    delete c['caseLocalUtcOffsetMinutes'];
    expect(codeOf(() => loadCompiledCase(c))).toBe('missing-offset');
    c['caseLocalUtcOffsetMinutes'] = 15 * 60;
    expect(codeOf(() => loadCompiledCase(c))).toBe('missing-offset');
  });

  it('supports exactly one schema major (D-DATA-002)', () => {
    const c = chunk();
    (c['case'] as Record<string, unknown>)['schemaVersion'] = '1.0';
    expect(codeOf(() => loadCompiledCase(c))).toBe('schema-major-mismatch');
    const c2 = chunk();
    (c2['case'] as Record<string, unknown>)['schemaVersion'] = '0.9';
    expect(codeOf(() => loadCompiledCase(c2))).toBe('loaded');
  });

  it('refuses sections that disagree on the case id', () => {
    const c = chunk();
    (c['reference'] as Record<string, unknown>)['caseId'] = 'c99-other';
    expect(codeOf(() => loadCompiledCase(c))).toBe('case-id-mismatch');
  });

  it('refuses an unparseable T0', () => {
    const c = chunk();
    (c['evidence'] as Record<string, unknown>)['T0'] = 'T0';
    expect(codeOf(() => loadCompiledCase(c))).toBe('bad-time');
  });
});
