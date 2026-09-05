// SPDX-License-Identifier: MIT
/**
 * Node-only run (D-ARCH-006 acceptance): the engine's whole surface runs where no DOM exists.
 * The compile-level half is tsconfig.json (`lib: ES2023`, `types: []`); the lint half is the
 * determinism fence; this is the runtime half.
 */
import { describe, expect, it } from 'vitest';
import * as engine from './index.ts';
import { exemplarCase } from './test-support/exemplar.ts';
import { APP_VERSION } from './test-support/session.ts';

describe('headless', () => {
  it('runs in an environment with no DOM globals', () => {
    expect(typeof (globalThis as { window?: unknown }).window).toBe('undefined');
    expect(typeof (globalThis as { document?: unknown }).document).toBe('undefined');
  });

  it('exercises the full public surface without touching a browser or Node API', () => {
    const compiled = engine.loadCompiledCase(structuredClone(exemplarCase()));
    const session = engine.createSession({ case: compiled, appVersion: APP_VERSION });
    expect(session.dispatch({ type: 'open-source', sourceId: 'src-interview' }).ok).toBe(true);
    const view = session.getView();
    expect(view.sources[0]?.status).toBe('open');
    const adapter = engine.createPersistenceAdapter(null);
    expect(adapter.save(session.serialize())).toEqual({ kind: 'unavailable' });
    expect(engine.ENGINE_PACKAGE).toBe('@medrecsim/engine');
    expect(engine.ENGINE_STATE_VERSION).toBe(1);
    expect(engine.LEARNER_ACTION_TYPES).toContain('sign');
    expect(engine.ENGINE_ERROR_CODES).toContain('post-t0-mutation');
  });
});
