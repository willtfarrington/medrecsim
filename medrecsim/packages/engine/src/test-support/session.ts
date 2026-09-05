// SPDX-License-Identifier: MIT
/** Test support: sessions over the exemplar and small Result helpers. */
import type { LearnerAction } from '../core/actions.ts';
import type { Result } from '../core/errors.ts';
import { createSession, type Session } from '../session.ts';
import { exemplarCase } from './exemplar.ts';
import type { CompiledCase } from '../case-loader.ts';

export const APP_VERSION = '0.0.0-test';

export function newSession(compiled: CompiledCase = exemplarCase()): Session {
  return createSession({ case: compiled, appVersion: APP_VERSION });
}

/** Unwraps an ok Result or throws with the engine error's code and message. */
export function must<T>(r: Result<T>): T {
  if (!r.ok) throw new Error(`${r.error.code}: ${r.error.message}`);
  return r.value;
}

/** Returns the error code of a failed Result, or 'ok' if it succeeded. */
export function codeOf<T>(r: Result<T>): string {
  return r.ok ? 'ok' : r.error.code;
}

export function run(session: Session, ...actions: LearnerAction[]): void {
  for (const a of actions) must(session.dispatch(a));
}

/** A session with the interview and the imported list open (the common starting point). */
export function openedSession(): Session {
  const s = newSession();
  run(s, { type: 'open-source', sourceId: 'src-interview' });
  run(s, { type: 'open-source', sourceId: 'src-ehr-list' });
  return s;
}
