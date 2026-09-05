// SPDX-License-Identifier: MIT
/**
 * Evidence projection (D-MED-005): the view shows what the learner has earned and nothing
 * from the reference layer. The type-level half is the layer fixture
 * (tsconfig.layer-fixture.json, scripts/check-layer-separation.mjs); this is the runtime spot
 * check plus the projection semantics.
 */
import { describe, expect, it } from 'vitest';
import { REFERENCE_TOP_LEVEL_KEYS } from '@medrecsim/schema';
import { REFERENCE_ID_PREFIXES } from '@medrecsim/schema';
import { exemplarCase } from '../test-support/exemplar.ts';
import { newSession, run } from '../test-support/session.ts';

/** Every object reachable from a value, by identity. */
function objectsOf(value: unknown, out = new Set<object>()): Set<object> {
  if (typeof value === 'object' && value !== null && !out.has(value)) {
    out.add(value);
    for (const v of Object.values(value as Record<string, unknown>)) objectsOf(v, out);
  }
  return out;
}

function walk(value: unknown, path: string, visit: (v: unknown, path: string) => void): void {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      visit(k, `${path}.${k}#key`);
      walk(v, `${path}.${k}`, visit);
    }
  }
}

function richSession() {
  const compiled = exemplarCase();
  const s = newSession(compiled);
  run(
    s,
    { type: 'open-source', sourceId: 'src-interview' },
    { type: 'open-source', sourceId: 'src-ehr-list' },
    { type: 'open-source', sourceId: 'src-artifacts' },
    { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' },
    { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-stopped' },
    { type: 'examine-artifact', artifactId: 'art-bottle-beta' },
    { type: 'escalate', channelId: 'esc-pharmacy' },
    { type: 'escalate', channelId: 'esc-pcp-office' },
    { type: 'await-escalation', channelId: 'esc-pharmacy' },
    {
      type: 'history/set',
      entry: {
        medKey: 'rx:rx-placeholder-alpha',
        status: 'self-discontinued',
        confidence: 'probable',
        claimIds: ['clm-ehr-alpha', 'clm-interview-alpha'],
      },
    },
    {
      type: 'discrepancy/set',
      entry: {
        entryId: 'dl-1',
        medKey: 'rx:rx-placeholder-alpha',
        classification: { type: 'commission', mechanism: 'stale-record-propagation' },
        claimIds: ['clm-ehr-alpha', 'clm-interview-alpha'],
        resolution: { kind: 'resolved-with-rationale', rationaleKey: 'rat-patient-stopped' },
      },
    },
    {
      type: 'action-list/set',
      entry: {
        medKey: 'rx:rx-placeholder-alpha',
        action: 'hold',
        rationaleKey: 'rat-patient-stopped',
      },
    },
  );
  return { compiled, s };
}

describe('runtime spot check: no reference-layer field reachable from the view', () => {
  it('shares no object with the reference layer and names no reference key or id', () => {
    const { compiled, s } = richSession();
    const view = s.getView();
    const referenceObjects = objectsOf(compiled.reference);
    const referenceKeys = new Set(REFERENCE_TOP_LEVEL_KEYS);
    // The rationale menu is the one sanctioned crossing: its keys are learner input vocabulary.
    const leaks: string[] = [];
    walk(view, 'view', (v, path) => {
      if (typeof v === 'object' && v !== null && referenceObjects.has(v))
        leaks.push(`${path}: shared object`);
      if (typeof v !== 'string') return;
      if (path.endsWith('#key') && referenceKeys.has(v)) leaks.push(`${path}: reference key ${v}`);
      for (const prefix of REFERENCE_ID_PREFIXES) {
        if (!v.startsWith(`${prefix}-`)) continue;
        if (prefix === 'rat' && path.startsWith('view.workspace.')) continue;
        leaks.push(`${path}: reference id ${v}`);
      }
    });
    expect(leaks).toEqual([]);
    expect(REFERENCE_TOP_LEVEL_KEYS).toContain('discrepancies');
    expect(Object.keys(view.workspace)).toEqual([
      'history',
      'discrepancyLog',
      'actionList',
      'rationaleMenu',
      'medications',
    ]);
  });

  it('carries the rationale menu as copied {key, text} pairs only', () => {
    const { compiled, s } = richSession();
    const menu = s.getView().workspace.rationaleMenu;
    expect(menu).toEqual(
      compiled.reference.actionSets.rationaleMenu.map(({ key, text }) => ({ key, text })),
    );
    expect(menu[0]).not.toBe(compiled.reference.actionSets.rationaleMenu[0]);
  });
});

describe('projection semantics', () => {
  it('shows only what the learner has earned', () => {
    const s = newSession();
    let v = s.getView();
    expect(v.claims).toEqual([]);
    expect(v.artifacts).toEqual([]);
    expect(v.dialogue[0]?.sourceOpen).toBe(false);
    expect(v.dialogue[0]?.nodes).toEqual([]);
    expect(v.sources.map((x) => [x.id, x.status])).toEqual([
      ['src-interview', 'available'],
      ['src-caregiver', 'on-request'],
      ['src-artifacts', 'available'],
      ['src-ehr-list', 'available'],
      ['src-discharge', 'available'],
      ['src-pharmacy', 'time-gated'],
      ['src-outpatient-note', 'available'],
    ]);
    expect(v.sources[5]?.availableAtIso).toBe('2026-01-15T20:15:00Z');
    expect(v.clock).toEqual({
      minutesSinceT0: 0,
      nowIso: '2026-01-15T19:30:00Z',
      t0Iso: '2026-01-15T19:30:00Z',
    });

    run(s, { type: 'open-source', sourceId: 'src-interview' });
    v = s.getView();
    // Entry node visible without its response; the locked follow-up is not listed at all.
    expect(v.dialogue[0]?.nodes.map((n) => [n.id, n.status, n.responseText])).toEqual([
      ['q-open', 'available', null],
    ]);
    run(s, { type: 'ask', treeId: 'dlg-patient', nodeId: 'q-open' });
    v = s.getView();
    expect(v.dialogue[0]?.nodes.map((n) => [n.id, n.status])).toEqual([
      ['q-open', 'asked'],
      ['q-stopped', 'available'],
    ]);
    expect(v.dialogue[0]?.nodes[0]?.responseText).toMatch(/^PLACEHOLDER/);
    expect(v.dialogue[0]?.nodes[0]?.askedAtIso).toBe('2026-01-15T19:35:00Z');
    expect(v.claims.map((c) => [c.id, c.reveal.via.kind, c.reveal.atIso])).toEqual([
      ['clm-interview-beta', 'dialogue-node', '2026-01-15T19:35:00Z'],
    ]);
    expect(v.workspace.medications.map((m) => m.medKey)).toEqual(['rx:rx-placeholder-beta']);

    run(s, { type: 'open-source', sourceId: 'src-artifacts' });
    v = s.getView();
    expect(v.artifacts.map((a) => [a.id, a.examined, a.renderText])).toEqual([
      ['art-bottle-beta', false, null],
    ]);
    run(s, { type: 'examine-artifact', artifactId: 'art-bottle-beta' });
    expect(s.getView().artifacts[0]?.renderText).toMatch(/^PLACEHOLDER/);
  });

  it('shows escalation state, response text only once answered, and the timeline', () => {
    const { s } = richSession();
    const v = s.getView();
    const pharmacy = v.escalations.find((e) => e.id === 'esc-pharmacy');
    const office = v.escalations.find((e) => e.id === 'esc-pcp-office');
    expect(pharmacy?.openNow).toBe(true);
    expect(pharmacy?.attempts[0]?.outcome).toBe('answered');
    expect(pharmacy?.attempts[0]?.responseText).toMatch(/^PLACEHOLDER/);
    expect(office?.attempts[0]?.outcome).toBe('awaiting-response');
    expect(office?.attempts[0]?.responseText).toBeNull();
    // Escalations were initiated at +11 min: office latency 45 → +56 (20:26Z); pharmacy 20 → +31.
    expect(office?.attempts[0]?.respondsAtIso).toBe('2026-01-15T20:26:00Z');
    expect(v.timeline.map((t) => [t.kind, t.channelId, t.atIso])).toEqual([
      ['escalation-response', 'esc-pharmacy', '2026-01-15T20:01:00Z'],
    ]);
    expect(v.clock.minutesSinceT0).toBe(31);
    expect(v.signed).toBe(false);
    expect(v.appliedActions).toBe(12);
  });

  it('is cached per state and recomputed after a successful dispatch only', () => {
    const s = newSession();
    const v1 = s.getView();
    expect(s.getView()).toBe(v1);
    s.dispatch({ type: 'open-source', sourceId: 'src-bogus' });
    expect(s.getView()).toBe(v1);
    run(s, { type: 'open-source', sourceId: 'src-interview' });
    expect(s.getView()).not.toBe(v1);
  });
});
