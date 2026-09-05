// SPDX-License-Identifier: MIT
/**
 * Pure simulated-time arithmetic (D-WF-002, D-MED-002).
 *
 * The engine is clock-free by lint rule: no `Date`, ever. Compiled bundles carry absolute UTC
 * instants (ADR-3, tension T-1), and the session clock is an integer number of simulated
 * minutes since the admission anchor T0. This module converts between the two with integer
 * calendar arithmetic (proleptic Gregorian; the days-from-civil / civil-from-days algorithms)
 * so that parsing, formatting and weekday lookup are the same on every machine and locale.
 */

export const MINUTE_MS = 60_000;
export const DAY_MS = 86_400_000;
export const DAY_MINUTES = 1_440;

/** Weekday tokens in the schema's own order (escalation availability windows). */
export const WEEKDAY_TOKENS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type WeekdayToken = (typeof WEEKDAY_TOKENS)[number];

// 1970-01-01 was a Thursday: index 3 in the mon-first list.
const EPOCH_WEEKDAY_INDEX = 3;

const ISO_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:Z|([+-])(\d{2}):?(\d{2}))$/;
const CLOCK_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Days since 1970-01-01 for a proleptic-Gregorian civil date. */
export function daysFromCivil(year: number, month: number, day: number): number {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const mp = month > 2 ? month - 3 : month + 9;
  const doy = Math.floor((153 * mp + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146_097 + doe - 719_468;
}

export interface CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Civil date for a number of days since 1970-01-01. */
export function civilFromDays(days: number): CivilDate {
  const z = days + 719_468;
  const era = Math.floor(z / 146_097);
  const doe = z - era * 146_097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1_460) + Math.floor(doe / 36_524) - Math.floor(doe / 146_096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/**
 * Parses an ISO-8601 date-time (UTC `Z` or a numeric offset) to epoch milliseconds.
 * Returns null for anything else: the engine never guesses at a time.
 */
export function parseIsoToEpochMs(iso: string): number | null {
  const m = ISO_RE.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = m[6] === undefined ? 0 : Number(m[6]);
  const millis = m[7] === undefined ? 0 : Number(m[7].padEnd(3, '0'));
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  let offsetMinutes = 0;
  if (m[8] !== undefined) {
    const sign = m[8] === '-' ? -1 : 1;
    offsetMinutes = sign * (Number(m[9]) * 60 + Number(m[10]));
  }
  const days = daysFromCivil(year, month, day);
  const localMs = days * DAY_MS + ((hour * 60 + minute) * 60 + second) * 1000 + millis;
  return localMs - offsetMinutes * MINUTE_MS;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, '0');
}

/** Formats epoch milliseconds as `YYYY-MM-DDTHH:MM:SSZ` (`.sss` kept only when non-zero). */
export function formatEpochMsAsIso(epochMs: number): string {
  const days = Math.floor(epochMs / DAY_MS);
  const rem = epochMs - days * DAY_MS;
  const { year, month, day } = civilFromDays(days);
  const hour = Math.floor(rem / 3_600_000);
  const minute = Math.floor((rem % 3_600_000) / 60_000);
  const second = Math.floor((rem % 60_000) / 1000);
  const millis = rem % 1000;
  const frac = millis === 0 ? '' : `.${pad(millis, 3)}`;
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(hour, 2)}:${pad(minute, 2)}:${pad(second, 2)}${frac}Z`;
}

/** Whole simulated minutes from `fromMs` to `toMs`, rounded up (never earlier than authored). */
export function minutesBetween(fromMs: number, toMs: number): number {
  return Math.ceil((toMs - fromMs) / MINUTE_MS);
}

/** Minute of the day (0–1439) for an authored `HH:MM` clock time; null if malformed. */
export function parseClockTime(hhmm: string): number | null {
  const m = CLOCK_RE.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export interface LocalClock {
  /** Local calendar day as a count of days since 1970-01-01 in local time. */
  readonly dayIndex: number;
  readonly weekday: WeekdayToken;
  readonly minuteOfDay: number;
}

/** The case-local wall clock for an instant, given the case's fixed UTC offset. */
export function localClockOf(epochMs: number, utcOffsetMinutes: number): LocalClock {
  const localMs = epochMs + utcOffsetMinutes * MINUTE_MS;
  const dayIndex = Math.floor(localMs / DAY_MS);
  const minuteOfDay = Math.floor((localMs - dayIndex * DAY_MS) / MINUTE_MS);
  return { dayIndex, weekday: weekdayOfDayIndex(dayIndex), minuteOfDay };
}

export function weekdayOfDayIndex(dayIndex: number): WeekdayToken {
  const idx = (((dayIndex + EPOCH_WEEKDAY_INDEX) % 7) + 7) % 7;
  return WEEKDAY_TOKENS[idx] as WeekdayToken;
}

/** Epoch milliseconds of a case-local day index + minute of day. */
export function epochMsOfLocal(
  dayIndex: number,
  minuteOfDay: number,
  utcOffsetMinutes: number,
): number {
  return dayIndex * DAY_MS + minuteOfDay * MINUTE_MS - utcOffsetMinutes * MINUTE_MS;
}
