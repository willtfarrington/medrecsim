// SPDX-License-Identifier: MIT
/**
 * Read-only index over a case's learner-observable evidence layer (D-MED-005). Built once at
 * session creation; the reducer and the projection consult it and never anything from the
 * reference layer. This module compiles inside the engine's evidence-only TypeScript project
 * (tsconfig.evidence.json), which cannot reach `@medrecsim/schema/reference`.
 */
import type {
  AllergyClaim,
  Artifact,
  Claim,
  DialogueTree,
  EscalationChannelDef,
  EvidenceDocument,
  Patient,
  Source,
} from '@medrecsim/schema/evidence';
import { medKeyOf, type MedKey } from './actions.ts';
import { minutesBetween, parseIsoToEpochMs } from './time.ts';

export type DialogueNode = DialogueTree['nodes'][number];

export interface IndexedNode {
  readonly tree: DialogueTree;
  readonly node: DialogueNode;
}

export interface EvidenceIndex {
  readonly caseId: string;
  readonly patient: Patient;
  readonly t0Iso: string;
  readonly t0EpochMs: number;
  readonly localUtcOffsetMinutes: number;
  readonly sources: ReadonlyMap<string, Source>;
  readonly sourceOrder: readonly string[];
  /** Simulated minutes since T0 at which a time-gated source becomes available. */
  readonly availableFromMinutes: ReadonlyMap<string, number>;
  readonly claims: ReadonlyMap<string, Claim>;
  readonly claimOrder: readonly string[];
  readonly allergyClaims: ReadonlyMap<string, AllergyClaim>;
  readonly allergyClaimOrder: readonly string[];
  /**
   * Allergy claims named by any reveal wiring (a dialogue node or an escalation response).
   * The schema gives allergy claims no `visibility` field (recorded as schema friction at
   * EP-11); the engine treats a wired claim as on-reveal and every other one as with-source.
   */
  readonly onRevealAllergyClaimIds: ReadonlySet<string>;
  readonly trees: ReadonlyMap<string, DialogueTree>;
  readonly treeOrder: readonly string[];
  /** Keyed by `${treeId}/${nodeId}`. */
  readonly nodes: ReadonlyMap<string, IndexedNode>;
  readonly artifacts: ReadonlyMap<string, Artifact>;
  readonly artifactOrder: readonly string[];
  readonly channels: ReadonlyMap<string, EscalationChannelDef>;
  readonly channelOrder: readonly string[];
  /** Every medication the evidence layer names, by key, in first-appearance order. */
  readonly medications: ReadonlyMap<MedKey, MedicationRef>;
}

export interface MedicationRef {
  readonly medKey: MedKey;
  readonly formularyId: string | null;
  readonly unresolvedLabelText: string | null;
}

export class EvidenceIndexError extends Error {
  override readonly name = 'EvidenceIndexError';
}

function unparseable(what: string, value: string): never {
  throw new EvidenceIndexError(`${what} is not an absolute ISO-8601 instant: ${value}`);
}

export function buildEvidenceIndex(
  evidence: EvidenceDocument,
  localUtcOffsetMinutes: number,
): EvidenceIndex {
  const t0EpochMs = parseIsoToEpochMs(evidence.T0) ?? unparseable('T0', evidence.T0);

  const sources = new Map<string, Source>();
  const availableFromMinutes = new Map<string, number>();
  for (const s of evidence.sources) {
    sources.set(s.id, s);
    if (s.availability === 'time-gated') {
      const from = s.availableFrom ?? unparseable(`source ${s.id} availableFrom`, '(missing)');
      const ms = parseIsoToEpochMs(from) ?? unparseable(`source ${s.id} availableFrom`, from);
      availableFromMinutes.set(s.id, minutesBetween(t0EpochMs, ms));
    }
  }

  const claims = new Map<string, Claim>();
  const medications = new Map<MedKey, MedicationRef>();
  for (const c of evidence.claims) {
    claims.set(c.id, c);
    const key = medKeyOf(c);
    if (key !== null && !medications.has(key)) {
      medications.set(key, {
        medKey: key,
        formularyId: c.formularyId ?? null,
        unresolvedLabelText: c.unresolvedLabel?.text ?? null,
      });
    }
  }

  const allergyClaims = new Map<string, AllergyClaim>();
  for (const a of evidence.allergyClaims) allergyClaims.set(a.id, a);

  const onRevealAllergyClaimIds = new Set<string>();
  const trees = new Map<string, DialogueTree>();
  const nodes = new Map<string, IndexedNode>();
  for (const tree of evidence.dialogueTrees) {
    trees.set(tree.id, tree);
    for (const node of tree.nodes) {
      nodes.set(`${tree.id}/${node.id}`, { tree, node });
      for (const id of node.revealsAllergyClaimIds) onRevealAllergyClaimIds.add(id);
    }
  }

  const artifacts = new Map<string, Artifact>();
  for (const a of evidence.artifacts) artifacts.set(a.id, a);

  const channels = new Map<string, EscalationChannelDef>();
  for (const ch of evidence.escalationChannels) {
    channels.set(ch.id, ch);
    for (const id of ch.responseContent.revealsAllergyClaimIds) onRevealAllergyClaimIds.add(id);
  }

  return {
    caseId: evidence.caseId,
    patient: evidence.patient,
    t0Iso: evidence.T0,
    t0EpochMs,
    localUtcOffsetMinutes,
    sources,
    sourceOrder: evidence.sources.map((s) => s.id),
    availableFromMinutes,
    claims,
    claimOrder: evidence.claims.map((c) => c.id),
    allergyClaims,
    allergyClaimOrder: evidence.allergyClaims.map((a) => a.id),
    onRevealAllergyClaimIds,
    trees,
    treeOrder: evidence.dialogueTrees.map((t) => t.id),
    nodes,
    artifacts,
    artifactOrder: evidence.artifacts.map((a) => a.id),
    channels,
    channelOrder: evidence.escalationChannels.map((c) => c.id),
    medications,
  };
}
