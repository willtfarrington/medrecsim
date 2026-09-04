// SPDX-License-Identifier: MIT
/**
 * Simulated time (D-WF-002, D-MED-002; tension T-1 — "author relative, compile absolute").
 *
 * Authors write times relative to the admission anchor `T0`, e.g. `T0-2y`, `T0-3d-4h`,
 * `T0+30m`, or `T0` itself; an absolute ISO-8601 date-time with offset is also accepted for
 * the rare fixed-calendar fact. The `compile` step resolves everything to absolute UTC ISO
 * strings so the engine and the debrief timeline never see relative syntax (ADR-3).
 *
 * Offsets are applied left to right. Years and months use UTC calendar arithmetic
 * (`setUTCFullYear` / `setUTCMonth`, JavaScript overflow semantics); weeks, days, hours and
 * minutes are fixed durations. Units: `y` `mo` `w` `d` `h` `m`.
 */
import { z } from 'zod';

export const RELATIVE_SIM_TIME_RE = /^T0(?:[+-]\d+(?:mo|y|w|d|h|m))*$/;
const OFFSET_RE = /([+-])(\d+)(mo|y|w|d|h|m)/g;

export const RelativeSimTime = z
  .string()
  .regex(RELATIVE_SIM_TIME_RE, 'T0 with optional signed offsets, e.g. T0-3d-4h')
  .describe('Time relative to admission T0, e.g. T0-2y, T0-3d-4h, T0+30m');

export const AbsoluteTime = z.iso
  .datetime({ offset: true })
  .describe('Absolute ISO-8601 date-time with UTC offset, e.g. 2026-01-15T14:30:00-05:00');

export const SimTime = z
  .union([RelativeSimTime, AbsoluteTime])
  .describe('Simulated time: relative to T0 (preferred) or absolute ISO-8601 with offset');
export type SimTime = z.infer<typeof SimTime>;

/** `HH:MM` wall-clock time in the case's local time (escalation availability windows). */
export const ClockTime = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'HH:MM')
  .describe('Wall-clock time HH:MM (24-hour) in the case locale');

const UNIT_MS: Record<'w' | 'd' | 'h' | 'm', number> = {
  w: 7 * 24 * 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
};

/**
 * Resolve a SimTime to an absolute instant. Returns null when either input is unparseable.
 * Pure: no wall clock, no locale.
 */
export function resolveSimTime(value: string, t0Iso: string): Date | null {
  const t0 = new Date(t0Iso);
  if (Number.isNaN(t0.getTime())) return null;
  if (!RELATIVE_SIM_TIME_RE.test(value)) {
    const abs = new Date(value);
    return Number.isNaN(abs.getTime()) ? null : abs;
  }
  const out = new Date(t0.getTime());
  for (const m of value.matchAll(OFFSET_RE)) {
    const sign = m[1] === '-' ? -1 : 1;
    const n = sign * Number(m[2]);
    const unit = m[3];
    if (unit === 'y') out.setUTCFullYear(out.getUTCFullYear() + n);
    else if (unit === 'mo') out.setUTCMonth(out.getUTCMonth() + n);
    else out.setTime(out.getTime() + n * UNIT_MS[unit as 'w' | 'd' | 'h' | 'm']);
  }
  return out;
}

/** Absolute UTC ISO string for compiled output (no milliseconds when zero). */
export function toCompiledIso(date: Date): string {
  return date.toISOString().replace(/\.000Z$/, 'Z');
}
