// SPDX-License-Identifier: MIT
/** The API seam as landed (architecture §2), including the fail-closed EP-12 stubs. */
import { describe, expect, it } from 'vitest';
import { createSession } from './session.ts';
import { exemplarCase } from './test-support/exemplar.ts';
import { APP_VERSION, codeOf, newSession, run } from './test-support/session.ts';

describe('createSession seam', () => {
  it('exposes getState, getView, dispatch, canSign, sign, getDebrief, serialize (+ getLog, subscribe)', () => {
    const s = newSession();
    for (const member of [
      'getState',
      'getView',
      'dispatch',
      'canSign',
      'sign',
      'getDebrief',
      'serialize',
      'getLog',
      'subscribe',
    ] as const) {
      expect(typeof s[member], member).toBe('function');
    }
    expect(s.caseId).toBe('c00-exemplar-scaffold');
  });

  it('canSign / sign / getDebrief are fail-closed stubs until EP-12', () => {
    const s = newSession();
    expect(s.canSign()).toEqual({
      ready: false,
      blocking: [
        {
          code: 'signature-validation-not-implemented',
          message: 'Signature validation (D-WF-004) lands at EP-12; the case cannot be signed yet.',
        },
      ],
    });
    const r = s.sign();
    expect(codeOf(r)).toBe('not-implemented');
    expect(s.getState().signedAtMinutes).toBeNull();
    expect(s.getLog()).toEqual([]);
    expect(s.getDebrief()).toEqual({
      available: false,
      reason: 'not-signed',
      message: 'the case is not signed',
    });
    expect(codeOf(s.dispatch({ type: 'sign' }))).toBe('sign-via-seam');
  });

  it('a signed log (replayed) freezes the session and reports the debrief as pending', () => {
    const s = createSession({
      case: exemplarCase(),
      appVersion: APP_VERSION,
      log: [{ type: 'open-source', sourceId: 'src-interview' }, { type: 'sign' }],
    });
    expect(s.getState().signedAtMinutes).toBe(0);
    expect(s.getView().signed).toBe(true);
    expect(s.getView().signedAtIso).toBe('2026-01-15T19:30:00Z');
    expect(s.canSign()).toMatchObject({ ready: false, blocking: [{ code: 'already-signed' }] });
    expect(codeOf(s.sign())).toBe('session-signed');
    expect(codeOf(s.dispatch({ type: 'open-source', sourceId: 'src-ehr-list' }))).toBe(
      'session-signed',
    );
    expect(s.getDebrief()).toMatchObject({ available: false, reason: 'not-implemented' });
  });

  it('throws on a starting log that does not replay (restoreSession maps this to a discard)', () => {
    expect(() =>
      createSession({
        case: exemplarCase(),
        appVersion: APP_VERSION,
        log: [{ type: 'ask', treeId: 'x', nodeId: 'y' }],
      }),
    ).toThrow(/unknown-dialogue-node/);
  });

  it('notifies subscribers after successful dispatches only, and unsubscribes', () => {
    const s = newSession();
    let calls = 0;
    const off = s.subscribe(() => calls++);
    s.dispatch({ type: 'open-source', sourceId: 'src-bogus' });
    expect(calls).toBe(0);
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    expect(calls).toBe(1);
    off();
    run(s, { type: 'open-source', sourceId: 'src-ehr-list' });
    expect(calls).toBe(1);
  });

  it('getLog returns a copy; the log equals appliedActions', () => {
    const s = newSession();
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    const log = s.getLog();
    (log as unknown[]).push({ type: 'sign' });
    expect(s.getLog()).toHaveLength(1);
    expect(s.getState().appliedActions).toBe(1);
  });
});
