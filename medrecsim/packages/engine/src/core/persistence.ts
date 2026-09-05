// SPDX-License-Identifier: MIT
/**
 * Engine-owned persistence (D-ARCH-005; architecture §2). What is persisted is the action log,
 * never derived state, wrapped in a versioned envelope. Loading compares every envelope field
 * with what the running app expects; any difference — including any bump of the case's
 * contentVersion (integrator resolution I-4) — discards the stored session politely.
 *
 * The adapter takes a `StorageLike` (the app hands it `localStorage` at EP-15/EP-18; the
 * engine itself never touches a browser global) and wraps every access in try/catch so a
 * blocked or full storage degrades to "unavailable" rather than an exception. "Clear all local
 * data" enumerates the namespace prefix. Nothing ever leaves the machine.
 */
import { isLearnerAction, type LearnerAction } from './actions.ts';

export interface SessionEnvelope {
  readonly appVersion: string;
  /** Content-schema stamp `major.minor` (D-DATA-002). */
  readonly schemaVersion: string;
  readonly caseId: string;
  readonly caseContentVersion: string;
  readonly engineStateVersion: number;
  readonly log: readonly LearnerAction[];
}

export type EnvelopeExpectation = Omit<SessionEnvelope, 'log'>;

export interface EnvelopeMismatch {
  readonly field: keyof EnvelopeExpectation;
  readonly expected: string | number;
  readonly found: string | number | null;
}

export type EnvelopeCheck =
  | { readonly ok: true; readonly envelope: SessionEnvelope }
  | { readonly ok: false; readonly reason: 'malformed'; readonly message: string }
  | { readonly ok: false; readonly reason: 'mismatch'; readonly mismatch: EnvelopeMismatch };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Structural check plus field-by-field comparison; the log's entries are shape-checked too. */
export function checkEnvelope(value: unknown, expected: EnvelopeExpectation): EnvelopeCheck {
  if (!isRecord(value)) return { ok: false, reason: 'malformed', message: 'not an object' };
  const fields: (keyof EnvelopeExpectation)[] = [
    'engineStateVersion',
    'schemaVersion',
    'caseId',
    'caseContentVersion',
    'appVersion',
  ];
  for (const field of fields) {
    const found = value[field];
    if (found !== expected[field]) {
      return {
        ok: false,
        reason: 'mismatch',
        mismatch: {
          field,
          expected: expected[field],
          found: typeof found === 'string' || typeof found === 'number' ? found : null,
        },
      };
    }
  }
  const log = value['log'];
  if (!Array.isArray(log))
    return { ok: false, reason: 'malformed', message: 'log is not an array' };
  const bad = log.findIndex((a) => !isLearnerAction(a));
  if (bad >= 0)
    return { ok: false, reason: 'malformed', message: `log entry ${bad} is not an action` };
  return {
    ok: true,
    envelope: { ...expected, log: log as LearnerAction[] },
  };
}

/** The subset of the Web Storage interface the adapter uses; no DOM types are involved. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

export type SaveResult =
  | { readonly kind: 'saved'; readonly key: string }
  | { readonly kind: 'unavailable' }
  | { readonly kind: 'failed'; readonly key: string; readonly message: string };

export type LoadResult =
  | { readonly kind: 'restored'; readonly key: string; readonly envelope: SessionEnvelope }
  | { readonly kind: 'none'; readonly key: string }
  | { readonly kind: 'unavailable' }
  | {
      readonly kind: 'discarded';
      readonly key: string;
      readonly reason: 'malformed' | 'mismatch';
      readonly mismatch: EnvelopeMismatch | null;
      readonly message: string;
    };

export type ClearResult =
  | { readonly kind: 'cleared'; readonly removed: readonly string[] }
  | { readonly kind: 'unavailable' };

export interface PersistenceAdapter {
  readonly namespace: string;
  keyFor(caseId: string): string;
  /** Every key in storage that starts with the namespace prefix (empty when unavailable). */
  listKeys(): readonly string[];
  save(envelope: SessionEnvelope): SaveResult;
  load(expected: EnvelopeExpectation): LoadResult;
  clear(caseId: string): ClearResult;
  /** "Clear all local data": removes every key under the namespace prefix. */
  clearAll(): ClearResult;
}

export const DEFAULT_NAMESPACE = 'medrecsim:';

function describe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export function createPersistenceAdapter(
  storage: StorageLike | null | undefined,
  namespace: string = DEFAULT_NAMESPACE,
): PersistenceAdapter {
  const keyFor = (caseId: string) => `${namespace}session:${caseId}`;

  const listKeys = (): string[] => {
    if (!storage) return [];
    const keys: string[] = [];
    try {
      const n = storage.length;
      for (let i = 0; i < n; i++) {
        const k = storage.key(i);
        if (k !== null && k.startsWith(namespace)) keys.push(k);
      }
    } catch {
      return [];
    }
    return keys;
  };

  const removeAll = (keys: readonly string[]): ClearResult => {
    if (!storage) return { kind: 'unavailable' };
    const removed: string[] = [];
    for (const k of keys) {
      try {
        storage.removeItem(k);
        removed.push(k);
      } catch {
        // A key that cannot be removed is reported by omission.
      }
    }
    return { kind: 'cleared', removed };
  };

  return {
    namespace,
    keyFor,
    listKeys,
    save(envelope) {
      const key = keyFor(envelope.caseId);
      if (!storage) return { kind: 'unavailable' };
      try {
        storage.setItem(key, JSON.stringify(envelope));
        return { kind: 'saved', key };
      } catch (e) {
        return { kind: 'failed', key, message: describe(e) };
      }
    },
    load(expected) {
      const key = keyFor(expected.caseId);
      if (!storage) return { kind: 'unavailable' };
      let raw: string | null;
      try {
        raw = storage.getItem(key);
      } catch {
        return { kind: 'unavailable' };
      }
      if (raw === null) return { kind: 'none', key };
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        removeAll([key]);
        return {
          kind: 'discarded',
          key,
          reason: 'malformed',
          mismatch: null,
          message: describe(e),
        };
      }
      const check = checkEnvelope(parsed, expected);
      if (check.ok) return { kind: 'restored', key, envelope: check.envelope };
      removeAll([key]);
      if (check.reason === 'mismatch') {
        const m = check.mismatch;
        return {
          kind: 'discarded',
          key,
          reason: 'mismatch',
          mismatch: m,
          message: `stored ${m.field} ${String(m.found)} ≠ current ${String(m.expected)}; local session discarded`,
        };
      }
      return {
        kind: 'discarded',
        key,
        reason: 'malformed',
        mismatch: null,
        message: check.message,
      };
    },
    clear(caseId) {
      return removeAll([keyFor(caseId)]);
    },
    clearAll() {
      if (!storage) return { kind: 'unavailable' };
      return removeAll(listKeys());
    },
  };
}
