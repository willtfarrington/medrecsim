// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import { SimTime, resolveSimTime, toCompiledIso } from './sim-time.ts';

const T0 = '2026-01-15T14:30:00-05:00'; // 19:30Z

describe('SimTime (T-1: author relative, compile absolute)', () => {
  it('accepts relative and absolute forms, rejects garbage', () => {
    for (const ok of ['T0', 'T0-2y', 'T0-3d-4h', 'T0+30m', 'T0-6mo+2d', T0, '2026-01-15T19:30:00Z'])
      expect(SimTime.safeParse(ok).success, ok).toBe(true);
    for (const bad of ['T0-', 'T0-3x', 'yesterday', '2026-01-15', 'T1+2d', '3d'])
      expect(SimTime.safeParse(bad).success, bad).toBe(false);
  });
  it('resolves fixed durations', () => {
    expect(toCompiledIso(resolveSimTime('T0', T0)!)).toBe('2026-01-15T19:30:00Z');
    expect(toCompiledIso(resolveSimTime('T0+30m', T0)!)).toBe('2026-01-15T20:00:00Z');
    expect(toCompiledIso(resolveSimTime('T0-3d-4h', T0)!)).toBe('2026-01-12T15:30:00Z');
    expect(toCompiledIso(resolveSimTime('T0-2w', T0)!)).toBe('2026-01-01T19:30:00Z');
  });
  it('uses UTC calendar arithmetic for years and months', () => {
    expect(toCompiledIso(resolveSimTime('T0-2y', T0)!)).toBe('2024-01-15T19:30:00Z');
    expect(toCompiledIso(resolveSimTime('T0-6mo', T0)!)).toBe('2025-07-15T19:30:00Z');
  });
  it('passes absolute times through and rejects unparseable ones', () => {
    expect(toCompiledIso(resolveSimTime('2025-12-31T08:00:00+01:00', T0)!)).toBe(
      '2025-12-31T07:00:00Z',
    );
    expect(resolveSimTime('T0', 'not a date')).toBeNull();
    expect(resolveSimTime('nonsense', T0)).toBeNull();
  });
  it('is deterministic (no wall clock)', () => {
    const a = resolveSimTime('T0-1d', T0)!.getTime();
    const b = resolveSimTime('T0-1d', T0)!.getTime();
    expect(a).toBe(b);
  });
});
