// SPDX-License-Identifier: MIT
/**
 * The learner's view — the evidence projection (D-MED-005). Everything the UI needs before
 * signature is derived here from the evidence index and the folded state; nothing here can
 * name a reference-layer type: this module compiles inside the engine's evidence-only
 * TypeScript project, whose file list excludes `@medrecsim/schema/reference`.
 *
 * What is projected is what the learner has earned: claims are listed once revealed (with
 * how and when), dialogue nodes once unlocked (responses once asked), artifacts once their
 * source is open (render text once examined), escalation responses once they have arrived.
 *
 * One sanctioned crossing from the authored reference layer: the per-case rationale menu
 * (T-5) is a learner input vocabulary by decision (D-MED-004: justifications are chosen from
 * authored menus, never typed), so the session hands its `{key, text}` pairs in as
 * `LearnerMenus` — plain strings, copied, no reference type involved.
 */
import type {
  AllergyClaim,
  Claim,
  DialogueTree,
  EscalationChannelDef,
  Patient,
  Source,
} from '@medrecsim/schema/evidence';
import type { AdmissionActionEntry, DiscrepancyEntry, HistoryEntry } from './actions.ts';
import { channelWindowAt, isoAt } from './clock.ts';
import type { EvidenceIndex, MedicationRef } from './evidence-index.ts';
import { isNodeAsked, isNodeAvailable } from './dialogue.ts';
import {
  isSourceOpened,
  type EscalationRecord,
  type RevealVia,
  type ScheduledEventKind,
  type SessionState,
} from './state.ts';

export interface RationaleOption {
  readonly key: string;
  readonly text: string;
}

export interface LearnerMenus {
  readonly rationaleMenu: readonly RationaleOption[];
}

export interface ClockView {
  readonly minutesSinceT0: number;
  readonly nowIso: string;
  readonly t0Iso: string;
}

export type SourceStatus = 'open' | 'available' | 'on-request' | 'time-gated';

export type SourceView = Source & {
  readonly status: SourceStatus;
  readonly openedAtIso: string | null;
  /** For time-gated sources not yet open: when they become available. */
  readonly availableAtIso: string | null;
};

export interface RevealView {
  readonly atMinutes: number;
  readonly atIso: string;
  readonly via: RevealVia;
}

export type ClaimView = Claim & { readonly reveal: RevealView };
export type AllergyClaimView = AllergyClaim & { readonly reveal: RevealView };

export interface DialogueNodeView {
  readonly id: string;
  readonly questionText: string;
  readonly costMinutes: number;
  readonly status: 'available' | 'asked';
  readonly askedAtIso: string | null;
  readonly responseText: string | null;
  readonly reliabilityModifier: DialogueTree['nodes'][number]['reliabilityModifier'] | null;
}

export interface DialogueTreeView {
  readonly id: string;
  readonly sourceId: string;
  readonly interlocutor: DialogueTree['interlocutor'];
  readonly baselineReliability: DialogueTree['baselineReliability'];
  readonly viaInterpreter: DialogueTree['viaInterpreter'];
  readonly sourceOpen: boolean;
  /** Available and asked nodes only; locked follow-ups are not shown. */
  readonly nodes: readonly DialogueNodeView[];
}

export interface ArtifactView {
  readonly id: string;
  readonly sourceId: string;
  readonly kind: string;
  readonly title: string;
  readonly examineCostMinutes: number;
  readonly examined: boolean;
  readonly examinedAtIso: string | null;
  readonly renderText: string | null;
}

export type EscalationAttemptView = EscalationRecord & {
  readonly initiatedAtIso: string;
  readonly respondsAtIso: string | null;
  readonly answeredAtIso: string | null;
  readonly retryAfterIso: string | null;
  readonly nextOpensAtIso: string | null;
  readonly responseText: string | null;
};

export interface EscalationChannelView {
  readonly id: string;
  readonly channel: EscalationChannelDef['channel'];
  readonly label: string;
  readonly institutionId: string | null;
  readonly latencyMinutes: number;
  readonly availabilityWindow: EscalationChannelDef['availabilityWindow'];
  readonly openNow: boolean;
  readonly nextOpensAtIso: string | null;
  readonly attempts: readonly EscalationAttemptView[];
}

export interface TimelineEntryView {
  readonly kind: ScheduledEventKind;
  readonly atMinutes: number;
  readonly atIso: string;
  readonly firedAtMinutes: number;
  readonly firedAtIso: string;
  readonly sourceId: string | null;
  readonly channelId: string | null;
  readonly attempt: number | null;
}

export interface WorkspaceView {
  readonly history: readonly HistoryEntry[];
  readonly discrepancyLog: readonly DiscrepancyEntry[];
  readonly actionList: readonly AdmissionActionEntry[];
  readonly rationaleMenu: readonly RationaleOption[];
  /** Medications with at least one visible claim, in first-appearance order. */
  readonly medications: readonly MedicationRef[];
}

export interface SessionView {
  readonly caseId: string;
  readonly patient: Patient;
  readonly clock: ClockView;
  readonly sources: readonly SourceView[];
  readonly claims: readonly ClaimView[];
  readonly allergyClaims: readonly AllergyClaimView[];
  readonly dialogue: readonly DialogueTreeView[];
  readonly artifacts: readonly ArtifactView[];
  readonly escalations: readonly EscalationChannelView[];
  readonly timeline: readonly TimelineEntryView[];
  readonly workspace: WorkspaceView;
  readonly signed: boolean;
  readonly signedAtIso: string | null;
  readonly appliedActions: number;
}

function isoOrNull(index: EvidenceIndex, minutes: number | null): string | null {
  return minutes === null ? null : isoAt(index, minutes);
}

export function projectView(
  index: EvidenceIndex,
  state: SessionState,
  menus: LearnerMenus,
): SessionView {
  const now = state.clock.minutesSinceT0;

  const sources: SourceView[] = index.sourceOrder.flatMap((id) => {
    const source = index.sources.get(id);
    if (source === undefined) return [];
    const opened = state.sources.find((s) => s.sourceId === id);
    let status: SourceStatus;
    if (opened !== undefined) status = 'open';
    else if (source.availability === 'immediate') status = 'available';
    else if (source.availability === 'on-request') status = 'on-request';
    else status = (index.availableFromMinutes.get(id) ?? 0) <= now ? 'available' : 'time-gated';
    const availableAt = index.availableFromMinutes.get(id);
    return [
      {
        ...source,
        status,
        openedAtIso: opened === undefined ? null : isoAt(index, opened.openedAtMinutes),
        availableAtIso:
          status === 'time-gated' && availableAt !== undefined ? isoAt(index, availableAt) : null,
      },
    ];
  });

  const claims: ClaimView[] = state.reveals.flatMap((r) => {
    const claim = index.claims.get(r.claimId);
    if (claim === undefined) return [];
    return [
      {
        ...claim,
        reveal: { atMinutes: r.atMinutes, atIso: isoAt(index, r.atMinutes), via: r.via },
      },
    ];
  });

  const allergyClaims: AllergyClaimView[] = state.allergyReveals.flatMap((r) => {
    const claim = index.allergyClaims.get(r.claimId);
    if (claim === undefined) return [];
    return [
      {
        ...claim,
        reveal: { atMinutes: r.atMinutes, atIso: isoAt(index, r.atMinutes), via: r.via },
      },
    ];
  });

  const dialogue: DialogueTreeView[] = index.treeOrder.flatMap((treeId) => {
    const tree = index.trees.get(treeId);
    if (tree === undefined) return [];
    const sourceOpen = isSourceOpened(state, tree.sourceId);
    const nodes: DialogueNodeView[] = sourceOpen
      ? tree.nodes.flatMap((node) => {
          if (!isNodeAvailable(state, treeId, node.id, node.entry)) return [];
          const asked = state.asked.find((a) => a.treeId === treeId && a.nodeId === node.id);
          const wasAsked = asked !== undefined && isNodeAsked(state, treeId, node.id);
          return [
            {
              id: node.id,
              questionText: node.questionText,
              costMinutes: node.costMinutes,
              status: wasAsked ? 'asked' : 'available',
              askedAtIso: asked === undefined ? null : isoAt(index, asked.atMinutes),
              responseText: wasAsked ? node.responseText : null,
              reliabilityModifier: node.reliabilityModifier ?? null,
            },
          ];
        })
      : [];
    return [
      {
        id: tree.id,
        sourceId: tree.sourceId,
        interlocutor: tree.interlocutor,
        baselineReliability: tree.baselineReliability,
        viaInterpreter: tree.viaInterpreter,
        sourceOpen,
        nodes,
      },
    ];
  });

  const artifacts: ArtifactView[] = index.artifactOrder.flatMap((id) => {
    const artifact = index.artifacts.get(id);
    if (artifact === undefined || !isSourceOpened(state, artifact.sourceId)) return [];
    const examined = state.examined.find((e) => e.artifactId === id);
    return [
      {
        id: artifact.id,
        sourceId: artifact.sourceId,
        kind: artifact.kind,
        title: artifact.title,
        examineCostMinutes: artifact.examineCostMinutes,
        examined: examined !== undefined,
        examinedAtIso: examined === undefined ? null : isoAt(index, examined.atMinutes),
        renderText: examined === undefined ? null : artifact.renderText,
      },
    ];
  });

  const escalations: EscalationChannelView[] = index.channelOrder.flatMap((id) => {
    const channel = index.channels.get(id);
    if (channel === undefined) return [];
    const window = channelWindowAt(index, channel, now);
    const attempts: EscalationAttemptView[] = state.escalations
      .filter((e) => e.channelId === id)
      .map((e) => ({
        ...e,
        initiatedAtIso: isoAt(index, e.initiatedAtMinutes),
        respondsAtIso: isoOrNull(index, e.respondsAtMinutes),
        answeredAtIso: isoOrNull(index, e.answeredAtMinutes),
        retryAfterIso: isoOrNull(index, e.retryAfterMinutes),
        nextOpensAtIso: isoOrNull(index, e.nextOpensAtMinutes),
        responseText: e.outcome === 'answered' ? channel.responseContent.text : null,
      }));
    return [
      {
        id: channel.id,
        channel: channel.channel,
        label: channel.label,
        institutionId: channel.institutionId ?? null,
        latencyMinutes: channel.latencyMinutes,
        availabilityWindow: channel.availabilityWindow,
        openNow: window.open,
        nextOpensAtIso: isoOrNull(index, window.nextOpensAtMinutes),
        attempts,
      },
    ];
  });

  const timeline: TimelineEntryView[] = state.timeline.map(({ event, firedAtMinutes }) => ({
    kind: event.kind,
    atMinutes: event.atMinutes,
    atIso: isoAt(index, event.atMinutes),
    firedAtMinutes,
    firedAtIso: isoAt(index, firedAtMinutes),
    sourceId: event.kind === 'source-available' ? event.sourceId : null,
    channelId: event.kind === 'source-available' ? null : event.channelId,
    attempt: event.kind === 'source-available' ? null : event.attempt,
  }));

  const visibleMedKeys = new Set<string>();
  for (const c of claims) {
    const key = c.formularyId !== undefined ? `rx:${c.formularyId}` : c.unresolvedLabel?.text;
    if (c.formularyId !== undefined) visibleMedKeys.add(`rx:${c.formularyId}`);
    else if (key !== undefined) visibleMedKeys.add(`label:${key}`);
  }
  const medications: MedicationRef[] = [];
  for (const [key, ref] of index.medications) if (visibleMedKeys.has(key)) medications.push(ref);

  return {
    caseId: index.caseId,
    patient: index.patient,
    clock: { minutesSinceT0: now, nowIso: isoAt(index, now), t0Iso: index.t0Iso },
    sources,
    claims,
    allergyClaims,
    dialogue,
    artifacts,
    escalations,
    timeline,
    workspace: {
      history: state.workspace.history,
      discrepancyLog: state.workspace.discrepancyLog,
      actionList: state.workspace.actionList,
      rationaleMenu: menus.rationaleMenu,
      medications,
    },
    signed: state.signedAtMinutes !== null,
    signedAtIso: isoOrNull(index, state.signedAtMinutes),
    appliedActions: state.appliedActions,
  };
}
