// SPDX-License-Identifier: MIT
/**
 * The D-WF-004 signature gate (EP-12a; the owner's reading, D-WF-005): one test per blocking
 * reason, the ready path, the freeze, the replay guard, and a property tying `sign()` to
 * `canSign()` over generated logs.
 */
import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { ACTION_KINDS } from '@medrecsim/schema/vocab';
import type { LearnerAction } from './actions.ts';
import { buildEvidenceIndex } from './evidence-index.ts';
import { reduce } from './reduce.ts';
import { stableStringify } from './serialize.ts';
import { checkSignature } from './signature.ts';
import { createSession, restoreSession } from '../session.ts';
import { arbCandidateLog, driveSession, vocabularyOf } from '../test-support/arbitraries.ts';
import { exemplarCase } from '../test-support/exemplar.ts';
import { APP_VERSION, codeOf, newSession, run } from '../test-support/session.ts';

const ALPHA = 'rx:rx-placeholder-alpha';
const BETA = 'rx:rx-placeholder-beta';

const openEhr: LearnerAction = { type: 'open-source', sourceId: 'src-ehr-list' };
const holdAlpha: LearnerAction = {
  type: 'action-list/set',
  entry: { medKey: ALPHA, action: 'hold', rationaleKey: 'rat-patient-stopped' },
};

function logEntry(
  entryId: string,
  medKey: string,
  resolution: Extract<LearnerAction, { type: 'discrepancy/set' }>['entry']['resolution'],
): LearnerAction {
  return {
    type: 'discrepancy/set',
    entry: { entryId, medKey, classification: null, claimIds: [], resolution },
  };
}

describe('canSign / sign — the D-WF-004 blocking reasons', () => {
  it('blocks a medication the learner has seen until it carries an admission-action line', () => {
    const s = newSession();
    run(s, openEhr); // reveals the imported list's claim on medication alpha
    expect(s.canSign()).toEqual({
      ready: false,
      blocking: [
        {
          code: 'medication-without-status',
          message: expect.stringContaining(ALPHA) as unknown as string,
          medKey: ALPHA,
        },
      ],
    });
    const before = s.getState();
    const r = s.sign();
    expect(codeOf(r)).toBe('signature-blocked');
    expect(r.ok ? null : r.error.details).toEqual({
      blocking: 'medication-without-status',
      count: 1,
    });
    expect(s.getState()).toBe(before);
    expect(s.getLog()).toEqual([openEhr]);
  });

  it('accepts any admission action as a status, unable-to-verify and defer-with-plan included', () => {
    for (const action of ACTION_KINDS) {
      const s = newSession();
      run(s, openEhr, {
        type: 'action-list/set',
        entry: { medKey: ALPHA, action, rationaleKey: 'rat-unable-to-verify' },
      });
      expect(s.canSign(), action).toEqual({ ready: true, blocking: [] });
    }
  });

  it('does not ask for a status on a medication the learner has not seen', () => {
    const s = newSession();
    run(s, { type: 'open-source', sourceId: 'src-interview' }); // interview claims are on-reveal
    expect(s.getView().workspace.medications).toEqual([]);
    expect(s.canSign().ready).toBe(true);
  });

  it('blocks a discrepancy-log entry left open until it is resolved with a rationale', () => {
    const s = newSession();
    run(s, openEhr, holdAlpha, logEntry('dl-1', ALPHA, { kind: 'open' }));
    expect(s.canSign().blocking).toEqual([
      {
        code: 'discrepancy-unresolved',
        message: expect.stringContaining('dl-1') as unknown as string,
        entryId: 'dl-1',
        medKey: ALPHA,
      },
    ]);
    run(
      s,
      logEntry('dl-1', ALPHA, {
        kind: 'resolved-with-rationale',
        rationaleKey: 'rat-patient-stopped',
      }),
    );
    expect(s.canSign()).toEqual({ ready: true, blocking: [] });
  });

  it('blocks an entry marked escalated to a channel no escalation was initiated on', () => {
    const s = newSession();
    run(
      s,
      openEhr,
      holdAlpha,
      logEntry('dl-1', ALPHA, { kind: 'escalated', channelId: 'esc-pcp-office' }),
    );
    expect(s.canSign().blocking).toEqual([
      {
        code: 'escalation-not-initiated',
        message: expect.stringContaining('esc-pcp-office') as unknown as string,
        entryId: 'dl-1',
        medKey: ALPHA,
        channelId: 'esc-pcp-office',
      },
    ]);
    run(s, { type: 'escalate', channelId: 'esc-pcp-office' });
    expect(s.canSign()).toEqual({ ready: true, blocking: [] });
  });

  it('counts any escalation attempt, whatever its outcome', () => {
    const s = newSession();
    run(
      s,
      openEhr,
      holdAlpha,
      logEntry('dl-1', ALPHA, { kind: 'escalated', channelId: 'esc-pcp-office' }),
      { type: 'escalate', channelId: 'esc-pcp-office' },
    );
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const state = s.getState();
    for (const outcome of [
      'awaiting-response',
      'answered',
      'voicemail-left',
      'busy',
      'closed',
    ] as const) {
      const attempt = { ...state.escalations[0]!, outcome };
      expect(checkSignature(index, { ...state, escalations: [attempt] }).ready, outcome).toBe(true);
    }
    expect(checkSignature(index, { ...state, escalations: [] }).ready).toBe(false);
  });

  it('lists every reason in a stable order: medications first, then entries in log order', () => {
    const s = newSession();
    run(
      s,
      openEhr,
      { type: 'open-source', sourceId: 'src-artifacts' }, // reveals the bottle claim on beta
      logEntry('dl-b', BETA, { kind: 'escalated', channelId: 'esc-senior' }),
      logEntry('dl-a', ALPHA, { kind: 'open' }),
    );
    expect(s.canSign().blocking.map((b) => [b.code, 'medKey' in b ? b.medKey : null])).toEqual([
      ['medication-without-status', ALPHA],
      ['medication-without-status', BETA],
      ['escalation-not-initiated', BETA],
      ['discrepancy-unresolved', ALPHA],
    ]);
  });
});

describe('signing freezes the three artifacts', () => {
  it('refuses every further action and leaves the workspace byte-identical', () => {
    const s = newSession();
    run(s, openEhr, holdAlpha);
    expect(codeOf(s.sign())).toBe('ok');
    const frozen = stableStringify(s.getState());
    const attempts: LearnerAction[] = [
      { type: 'open-source', sourceId: 'src-interview' },
      {
        type: 'history/set',
        entry: { medKey: ALPHA, status: 'prescribed', confidence: 'unverified', claimIds: [] },
      },
      logEntry('dl-1', ALPHA, { kind: 'open' }),
      { type: 'action-list/remove', medKey: ALPHA },
      { type: 'request-hint', hintId: 'hint-alpha', tier: 'nudge' },
      { type: 'escalate', channelId: 'esc-senior' },
    ];
    for (const a of attempts) expect(codeOf(s.dispatch(a)), a.type).toBe('session-signed');
    expect(codeOf(s.sign())).toBe('session-signed');
    expect(s.canSign()).toMatchObject({ ready: false, blocking: [{ code: 'already-signed' }] });
    expect(stableStringify(s.getState())).toBe(frozen);
    expect(s.getLog()).toEqual([openEhr, holdAlpha, { type: 'sign' }]);
  });
});

describe('the gate guards replay too', () => {
  it('refuses a sign through reduce when the gate fails, even with allowSign', () => {
    const s = newSession();
    run(s, openEhr);
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const ctx = { index, rationaleKeys: new Set<string>(), hintIds: new Set<string>() };
    expect(codeOf(reduce(ctx, s.getState(), { type: 'sign' }, { allowSign: true }))).toBe(
      'signature-blocked',
    );
  });

  it('discards a stored log whose signature came before a complete workspace', () => {
    const tampered = { ...newSession().serialize(), log: [openEhr, { type: 'sign' }] };
    const r = restoreSession({ case: exemplarCase(), appVersion: APP_VERSION, envelope: tampered });
    expect(r.kind).toBe('discarded');
    expect(r.kind === 'discarded' ? [r.reason, r.message] : null).toEqual([
      'corrupt-log',
      expect.stringContaining('signature-blocked'),
    ]);
  });

  it('restores a log signed after a complete workspace, signed and identical', () => {
    const s = newSession();
    run(s, openEhr, holdAlpha);
    expect(codeOf(s.sign())).toBe('ok');
    const r = restoreSession({
      case: exemplarCase(),
      appVersion: APP_VERSION,
      envelope: s.serialize(),
    });
    expect(r.kind).toBe('restored');
    if (r.kind === 'restored') {
      expect(r.session.getState().signedAtMinutes).toBe(1);
      expect(stableStringify(r.session.getState())).toBe(stableStringify(s.getState()));
    }
  });
});

describe('property: sign() succeeds exactly when canSign() is ready (300 logs)', () => {
  it('and a successful signature restores identically from its envelope', () => {
    const compiled = exemplarCase();
    const index = buildEvidenceIndex(compiled.evidence, compiled.caseLocalUtcOffsetMinutes);
    const vocab = vocabularyOf(
      index,
      compiled.reference.actionSets.rationaleMenu.map((m) => m.key),
      compiled.reference.hints.map((h) => h.id),
    );
    let signed = 0;
    let blocked = 0;
    fc.assert(
      fc.property(arbCandidateLog(vocab), (candidates) => {
        const s = newSession(compiled);
        driveSession(s, candidates);
        const check = s.canSign();
        const r = s.sign();
        if (check.ready) {
          signed++;
          expect(r.ok).toBe(true);
          const again = createSession({ case: compiled, appVersion: APP_VERSION, log: s.getLog() });
          expect(stableStringify(again.getState())).toBe(stableStringify(s.getState()));
        } else {
          blocked++;
          expect(codeOf(r)).toBe('signature-blocked');
          expect(r.ok ? null : r.error.details['blocking']).toBe(
            check.blocking.map((b) => b.code).join(','),
          );
          expect(s.getState().signedAtMinutes).toBeNull();
        }
      }),
      { numRuns: 300 },
    );
    expect(signed).toBeGreaterThan(0);
    expect(blocked).toBeGreaterThan(0);
  });
});
