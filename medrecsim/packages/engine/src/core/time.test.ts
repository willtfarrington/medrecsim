// SPDX-License-Identifier: MIT
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  DAY_MS,
  civilFromDays,
  daysFromCivil,
  formatEpochMsAsIso,
  localClockOf,
  minutesBetween,
  parseClockTime,
  parseIsoToEpochMs,
  weekdayOfDayIndex,
} from './time.ts';

// Tests are exempt from the clock-free rule: `Date` here is the oracle the pure code is checked against.
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

describe('calendar arithmetic (no Date in the engine)', () => {
  it('daysFromCivil / civilFromDays round-trip and agree with Date.UTC', () => {
    fc.assert(
      fc.property(fc.integer({ min: -400_000, max: 400_000 }), (days) => {
        const { year, month, day } = civilFromDays(days);
        expect(daysFromCivil(year, month, day)).toBe(days);
        const oracle = new Date(days * DAY_MS);
        expect([year, month, day]).toEqual([
          oracle.getUTCFullYear(),
          oracle.getUTCMonth() + 1,
          oracle.getUTCDate(),
        ]);
      }),
      { numRuns: 500 },
    );
  });

  it('weekdayOfDayIndex agrees with Date.getUTCDay', () => {
    fc.assert(
      fc.property(fc.integer({ min: -100_000, max: 100_000 }), (days) => {
        expect(weekdayOfDayIndex(days)).toBe(DAY_NAMES[new Date(days * DAY_MS).getUTCDay()]);
      }),
      { numRuns: 300 },
    );
  });
});

describe('ISO parsing and formatting', () => {
  it('formats like toISOString (without .000) and parses back (property)', () => {
    fc.assert(
      fc.property(fc.integer({ min: -30_000_000_000_000, max: 30_000_000_000_000 }), (ms) => {
        const iso = formatEpochMsAsIso(ms);
        expect(iso).toBe(new Date(ms).toISOString().replace(/\.000Z$/, 'Z'));
        expect(parseIsoToEpochMs(iso)).toBe(ms);
      }),
      { numRuns: 500 },
    );
  });

  it('parses numeric offsets like Date.parse', () => {
    for (const s of [
      '2026-01-15T14:30:00-05:00',
      '2026-01-15T14:30:00+05:30',
      '2026-01-15T14:30Z',
      '2026-07-01T00:00:00.250Z',
    ]) {
      expect(parseIsoToEpochMs(s)).toBe(Date.parse(s));
    }
  });

  it('returns null for anything it should not guess at', () => {
    for (const s of [
      'nonsense',
      '2026-01-15',
      '2026-02-30T00:00:00Z',
      '2026-13-01T00:00:00Z',
      '2026-01-15T24:00:00Z',
      '2026-01-15T14:30:00',
      'T0-3d',
    ]) {
      expect(parseIsoToEpochMs(s), s).toBeNull();
    }
  });

  it('minutesBetween rounds up so nothing is available earlier than authored', () => {
    expect(minutesBetween(0, 60_000)).toBe(1);
    expect(minutesBetween(0, 60_001)).toBe(2);
    expect(minutesBetween(60_000, 0)).toBe(-1);
  });
});

describe('case-local wall clock', () => {
  it('reads the exemplar T0 (19:30Z, offset -300) as Thursday 14:30 local', () => {
    const t0 = parseIsoToEpochMs('2026-01-15T19:30:00Z') as number;
    const local = localClockOf(t0, -300);
    expect(local.weekday).toBe('thu');
    expect(local.minuteOfDay).toBe(14 * 60 + 30);
  });

  it('crosses midnight and the weekday boundary with a positive offset', () => {
    const t = parseIsoToEpochMs('2026-01-15T20:00:00Z') as number;
    const local = localClockOf(t, 5 * 60 + 30);
    expect(local.weekday).toBe('fri');
    expect(local.minuteOfDay).toBe(90);
  });

  it('parses HH:MM clock times', () => {
    expect(parseClockTime('09:00')).toBe(540);
    expect(parseClockTime('23:59')).toBe(1439);
    expect(parseClockTime('24:00')).toBeNull();
    expect(parseClockTime('9:00')).toBeNull();
  });
});
