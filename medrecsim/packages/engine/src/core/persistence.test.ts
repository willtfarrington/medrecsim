// SPDX-License-Identifier: MIT
/**
 * Persistence (D-ARCH-005; I-4): the log is what is stored; any envelope mismatch discards
 * politely; storage failures degrade gracefully; clear-all enumerates the prefix.
 */
import { describe, expect, it } from 'vitest';
import { SCHEMA_VERSION } from '@medrecsim/schema/version';
import {
  checkEnvelope,
  createPersistenceAdapter,
  type SessionEnvelope,
  type StorageLike,
} from './persistence.ts';
import { ENGINE_STATE_VERSION } from './state.ts';
import { stableStringify } from './serialize.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { createSession, restoreSession } from '../session.ts';
import { APP_VERSION, newSession, run } from '../test-support/session.ts';

class MemoryStorage implements StorageLike {
  readonly map = new Map<string, string>();
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  get length() {
    return this.map.size;
  }
}

class BrokenStorage implements StorageLike {
  getItem(): string | null {
    throw new Error('blocked');
  }
  setItem(): void {
    throw new Error('quota');
  }
  removeItem(): void {
    throw new Error('blocked');
  }
  key(): string | null {
    throw new Error('blocked');
  }
  get length(): number {
    throw new Error('blocked');
  }
}

function playedSession() {
  const s = newSession();
  run(
    s,
    { type: 'open-source', sourceId: 'src-interview' },
    { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' },
    { type: 'open-source', sourceId: 'src-ehr-list' },
    {
      type: 'history/set',
      entry: {
        medKey: 'rx:rx-placeholder-beta',
        status: 'taking-as-directed',
        confidence: 'probable',
        claimIds: ['clm-interview-beta'],
      },
    },
  );
  return s;
}

describe('envelope', () => {
  it('serializes the action log, not derived state, with the five version fields', () => {
    const s = playedSession();
    const env = s.serialize();
    expect(env).toEqual({
      appVersion: APP_VERSION,
      schemaVersion: SCHEMA_VERSION,
      caseId: 'c00-exemplar-scaffold',
      caseContentVersion: '0.0.1',
      engineStateVersion: ENGINE_STATE_VERSION,
      log: s.getLog(),
    });
    expect(Object.keys(env)).not.toContain('state');
    expect(env.log).toHaveLength(4);
  });

  it('checkEnvelope names the first mismatching field and refuses malformed logs', () => {
    const env = playedSession().serialize();
    const expected = { ...env, log: undefined } as unknown as Omit<SessionEnvelope, 'log'>;
    expect(checkEnvelope(env, expected)).toMatchObject({ ok: true });
    for (const field of ['appVersion', 'schemaVersion', 'caseId', 'caseContentVersion'] as const) {
      const r = checkEnvelope({ ...env, [field]: 'other' }, expected);
      expect(r).toMatchObject({
        ok: false,
        reason: 'mismatch',
        mismatch: { field, found: 'other' },
      });
    }
    expect(checkEnvelope({ ...env, engineStateVersion: 2 }, expected)).toMatchObject({
      ok: false,
      reason: 'mismatch',
      mismatch: { field: 'engineStateVersion', expected: 1, found: 2 },
    });
    expect(checkEnvelope({ ...env, log: 'nope' }, expected)).toMatchObject({
      ok: false,
      reason: 'malformed',
    });
    expect(checkEnvelope({ ...env, log: [{ type: 'ask' }] }, expected)).toMatchObject({
      ok: false,
      reason: 'malformed',
    });
    expect(checkEnvelope(42, expected)).toMatchObject({ ok: false, reason: 'malformed' });
  });
});

describe('storage adapter', () => {
  it('saves and restores a session through a StorageLike', () => {
    const storage = new MemoryStorage();
    const adapter = createPersistenceAdapter(storage);
    const s = playedSession();
    expect(adapter.save(s.serialize())).toEqual({
      kind: 'saved',
      key: 'medrecsim:session:c00-exemplar-scaffold',
    });
    const loaded = adapter.load({ ...s.serialize(), log: undefined } as never);
    expect(loaded.kind).toBe('restored');
    if (loaded.kind !== 'restored') return;
    const restored = restoreSession({
      case: exemplarCase(),
      appVersion: APP_VERSION,
      envelope: loaded.envelope,
    });
    expect(restored.kind).toBe('restored');
    if (restored.kind !== 'restored') return;
    expect(stableStringify(restored.session.getState())).toBe(stableStringify(s.getState()));
    expect(restored.session.getLog()).toEqual(s.getLog());
  });

  it('discards on any mismatch (including a contentVersion bump, I-4) and removes the key', () => {
    const storage = new MemoryStorage();
    const adapter = createPersistenceAdapter(storage);
    const env = playedSession().serialize();
    adapter.save(env);
    const r = adapter.load({ ...env, caseContentVersion: '0.0.2' });
    expect(r).toMatchObject({
      kind: 'discarded',
      reason: 'mismatch',
      mismatch: { field: 'caseContentVersion', expected: '0.0.2', found: '0.0.1' },
    });
    expect(storage.length).toBe(0);
    adapter.save(env);
    expect(adapter.load({ ...env, appVersion: '9.9.9' })).toMatchObject({
      kind: 'discarded',
      mismatch: { field: 'appVersion' },
    });
    expect(adapter.load(env)).toEqual({ kind: 'none', key: adapter.keyFor(env.caseId) });
  });

  it('discards unparseable and malformed stored values', () => {
    const storage = new MemoryStorage();
    const adapter = createPersistenceAdapter(storage);
    const env = playedSession().serialize();
    storage.setItem(adapter.keyFor(env.caseId), '{not json');
    expect(adapter.load(env)).toMatchObject({ kind: 'discarded', reason: 'malformed' });
    storage.setItem(
      adapter.keyFor(env.caseId),
      JSON.stringify({ ...env, log: [{ type: 'nope' }] }),
    );
    expect(adapter.load(env)).toMatchObject({ kind: 'discarded', reason: 'malformed' });
    expect(storage.length).toBe(0);
  });

  it('clearAll enumerates the namespace prefix only', () => {
    const storage = new MemoryStorage();
    storage.setItem('other-app:thing', '1');
    const adapter = createPersistenceAdapter(storage);
    const env = playedSession().serialize();
    adapter.save(env);
    adapter.save({ ...env, caseId: 'c01-three-lists' });
    storage.setItem('medrecsim:settings', '{}');
    expect(adapter.listKeys()).toEqual([
      'medrecsim:session:c00-exemplar-scaffold',
      'medrecsim:session:c01-three-lists',
      'medrecsim:settings',
    ]);
    expect(adapter.clear('c01-three-lists')).toEqual({
      kind: 'cleared',
      removed: ['medrecsim:session:c01-three-lists'],
    });
    const cleared = adapter.clearAll();
    expect(cleared).toMatchObject({ kind: 'cleared' });
    expect([...storage.map.keys()]).toEqual(['other-app:thing']);
  });

  it('degrades gracefully when storage is missing or throws', () => {
    const none = createPersistenceAdapter(null);
    const env = playedSession().serialize();
    expect(none.save(env)).toEqual({ kind: 'unavailable' });
    expect(none.load(env)).toEqual({ kind: 'unavailable' });
    expect(none.clearAll()).toEqual({ kind: 'unavailable' });
    expect(none.listKeys()).toEqual([]);
    const broken = createPersistenceAdapter(new BrokenStorage());
    expect(broken.save(env)).toMatchObject({ kind: 'failed', message: 'quota' });
    expect(broken.load(env)).toEqual({ kind: 'unavailable' });
    expect(broken.listKeys()).toEqual([]);
    expect(broken.clearAll()).toEqual({ kind: 'cleared', removed: [] });
  });
});

describe('restoreSession', () => {
  it('discards a stored log that no longer replays (corrupt-log)', () => {
    const env = playedSession().serialize();
    const tampered = { ...env, log: [{ type: 'open-source', sourceId: 'src-nope' }] };
    const r = restoreSession({ case: exemplarCase(), appVersion: APP_VERSION, envelope: tampered });
    expect(r).toMatchObject({ kind: 'discarded', reason: 'corrupt-log' });
    if (r.kind === 'discarded') expect(r.message).toMatch(/unknown-source/);
  });

  it('discards on a schema stamp or engine version mismatch', () => {
    const env = playedSession().serialize();
    expect(
      restoreSession({
        case: exemplarCase(),
        appVersion: APP_VERSION,
        envelope: { ...env, schemaVersion: '9.0' },
      }),
    ).toMatchObject({
      kind: 'discarded',
      reason: 'mismatch',
      mismatch: { field: 'schemaVersion' },
    });
    expect(
      restoreSession({
        case: exemplarCase(),
        appVersion: APP_VERSION,
        envelope: { ...env, engineStateVersion: 0 },
      }),
    ).toMatchObject({
      kind: 'discarded',
      reason: 'mismatch',
      mismatch: { field: 'engineStateVersion' },
    });
    expect(
      restoreSession({ case: exemplarCase(), appVersion: APP_VERSION, envelope: 'junk' }),
    ).toMatchObject({
      kind: 'discarded',
      reason: 'malformed',
    });
  });

  it('a restored session continues exactly where the original would', () => {
    const original = playedSession();
    const r = restoreSession({
      case: exemplarCase(),
      appVersion: APP_VERSION,
      envelope: original.serialize(),
    });
    if (r.kind !== 'restored') throw new Error(r.message);
    const next = { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' } as const;
    original.dispatch(next);
    r.session.dispatch(next);
    expect(stableStringify(r.session.getState())).toBe(stableStringify(original.getState()));
    expect(
      createSession({
        case: exemplarCase(),
        appVersion: APP_VERSION,
        log: original.getLog(),
      }).getState(),
    ).toEqual(original.getState());
  });
});
