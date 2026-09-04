// SPDX-License-Identifier: MIT
/**
 * Core invariant subset for case bundles (EP-9; architecture §4). Each invariant is a pure
 * function over the parsed bundle plus context. Remaining catalogue entries land at EP-20.
 */
import type { z } from 'zod';
import { REVIEW_MODEL } from '../vocab/model.ts';
import type { AcceptedEntry } from '../reference/action-sets.ts';
import { findRealBrandName } from '../vocab/brand-denylist.ts';
import { findRealLookingIdentifiers } from '../vocab/synthetic-identifiers.ts';
import { REFERENCE_ID_PREFIXES } from '../common/ids.ts';
import { parseEvidenceRef } from '../common/refs.ts';
import { resolveSimTime } from '../common/sim-time.ts';
import { versionInRange } from '../common/versions.ts';
import { SCHEMA_VERSION } from '../version.ts';
import type { CitationRecord } from '../common/citation.ts';
import { lintHarmLanguage } from './harm-language.ts';
import {
  checkUniqueIds,
  finding,
  walkStrings,
  type CaseInvariant,
  type Finding,
  type PathSegment,
  type ValidationContext,
} from './types.ts';

const EVIDENCE = 'evidence.yaml';
const REFERENCE = 'reference.yaml';
const CASE = 'case.yaml';
const CITATIONS = 'citations.yaml';
const REVIEW = 'review-record.yaml';

// ---------------------------------------------------------------- INV-SHAPE-001 --
/**
 * Package-local invariant (not in the architecture catalogue): field co-requirements and
 * intra-bundle referential integrity that JSON Schema cannot express — duplicate ids, dangling
 * ids, "taking-differently needs how", "time-gated needs availableFrom", freeze notes.
 * Graph *reachability* of detectability paths is INV-DISC-002 (EP-20); this only checks that
 * every referenced id exists.
 */
export const INV_SHAPE_001: CaseInvariant = {
  id: 'INV-SHAPE-001',
  run(bundle, _input, ctx) {
    const out: Finding[] = [];
    const { evidence: ev, reference: ref, reviewRecord } = bundle;
    const id = this.id;

    // Uniqueness.
    out.push(...checkUniqueIds(id, EVIDENCE, ['sources'], ev.sources, 'source'));
    out.push(...checkUniqueIds(id, EVIDENCE, ['claims'], ev.claims, 'claim'));
    out.push(...checkUniqueIds(id, EVIDENCE, ['allergyClaims'], ev.allergyClaims, 'allergy claim'));
    out.push(...checkUniqueIds(id, EVIDENCE, ['dialogueTrees'], ev.dialogueTrees, 'dialogue tree'));
    out.push(...checkUniqueIds(id, EVIDENCE, ['artifacts'], ev.artifacts, 'artifact'));
    out.push(
      ...checkUniqueIds(
        id,
        EVIDENCE,
        ['escalationChannels'],
        ev.escalationChannels,
        'escalation channel',
      ),
    );
    out.push(
      ...checkUniqueIds(id, REFERENCE, ['referenceRegimen'], ref.referenceRegimen, 'regimen entry'),
    );
    out.push(
      ...checkUniqueIds(id, REFERENCE, ['actualUseState'], ref.actualUseState, 'actual-use entry'),
    );
    out.push(...checkUniqueIds(id, REFERENCE, ['discrepancies'], ref.discrepancies, 'discrepancy'));
    out.push(
      ...checkUniqueIds(
        id,
        REFERENCE,
        ['actionSets', 'rationaleMenu'],
        ref.actionSets.rationaleMenu,
        'rationale',
      ),
    );
    out.push(
      ...checkUniqueIds(
        id,
        REFERENCE,
        ['actionSets'],
        [...ref.actionSets.accepted, ...ref.actionSets.partiallyAccepted, ...ref.actionSets.unsafe],
        'action entry',
      ),
    );
    out.push(
      ...checkUniqueIds(
        id,
        REFERENCE,
        ['expectedEscalations'],
        ref.expectedEscalations,
        'expected escalation',
      ),
    );
    out.push(...checkUniqueIds(id, REFERENCE, ['hints'], ref.hints, 'hint'));
    out.push(
      ...checkUniqueIds(
        id,
        REFERENCE,
        ['teachingNoteRefs'],
        ref.teachingNoteRefs,
        'teaching-note ref',
      ),
    );
    out.push(
      ...checkUniqueIds(id, CITATIONS, ['citations'], bundle.citations.citations, 'citation'),
    );

    const sourceIds = new Set(ev.sources.map((s) => s.id));
    const claimIds = new Set(ev.claims.map((c) => c.id));
    const allergyIds = new Set(ev.allergyClaims.map((a) => a.id));
    const artifactIds = new Set(ev.artifacts.map((a) => a.id));
    const channelIds = new Set(ev.escalationChannels.map((e) => e.id));
    const nodeIds = new Set(ev.dialogueTrees.flatMap((t) => t.nodes.map((n) => n.id)));
    const regimenIds = new Set(ref.referenceRegimen.map((r) => r.id));
    const actualUseIds = new Set(ref.actualUseState.map((u) => u.id));
    const discrepancyIds = new Set(ref.discrepancies.map((d) => d.id));
    const teachingIds = new Set(ref.teachingNoteRefs.map((t) => t.id));

    const need = (
      file: string,
      path: PathSegment[],
      value: string | undefined,
      set: ReadonlySet<string>,
      what: string,
    ) => {
      if (value !== undefined && !set.has(value))
        out.push(finding(id, 'error', file, path, `${what} "${value}" does not exist`));
    };

    // Evidence-side references and co-requirements.
    ev.sources.forEach((s, i) => {
      if (s.availability === 'time-gated' && s.availableFrom === undefined)
        out.push(
          finding(
            id,
            'error',
            EVIDENCE,
            ['sources', i, 'availableFrom'],
            'time-gated source needs availableFrom',
          ),
        );
      if (
        s.institutionId !== undefined &&
        ctx.universe &&
        !ctx.universe.institutionIds.has(s.institutionId)
      )
        out.push(
          finding(
            id,
            'error',
            EVIDENCE,
            ['sources', i, 'institutionId'],
            `institution "${s.institutionId}" is not in the universe registry`,
          ),
        );
    });
    ev.claims.forEach((c, i) => {
      need(EVIDENCE, ['claims', i, 'sourceId'], c.sourceId, sourceIds, 'source');
      if (c.claimStatus === 'taking-differently' && c.howTakingDifferently === undefined)
        out.push(
          finding(
            id,
            'error',
            EVIDENCE,
            ['claims', i, 'howTakingDifferently'],
            'taking-differently requires howTakingDifferently (D-MED-001 "with how")',
          ),
        );
    });
    ev.allergyClaims.forEach((a, i) =>
      need(EVIDENCE, ['allergyClaims', i, 'sourceId'], a.sourceId, sourceIds, 'source'),
    );
    ev.dialogueTrees.forEach((t, i) => {
      need(EVIDENCE, ['dialogueTrees', i, 'sourceId'], t.sourceId, sourceIds, 'source');
      const local = new Set(t.nodes.map((n) => n.id));
      out.push(
        ...checkUniqueIds(id, EVIDENCE, ['dialogueTrees', i, 'nodes'], t.nodes, 'dialogue node'),
      );
      if (!t.nodes.some((n) => n.entry))
        out.push(
          finding(
            id,
            'error',
            EVIDENCE,
            ['dialogueTrees', i, 'nodes'],
            'dialogue tree has no entry node (entry: true)',
          ),
        );
      t.nodes.forEach((n, j) => {
        n.revealsClaimIds.forEach((c, k) =>
          need(
            EVIDENCE,
            ['dialogueTrees', i, 'nodes', j, 'revealsClaimIds', k],
            c,
            claimIds,
            'claim',
          ),
        );
        n.revealsAllergyClaimIds.forEach((c, k) =>
          need(
            EVIDENCE,
            ['dialogueTrees', i, 'nodes', j, 'revealsAllergyClaimIds', k],
            c,
            allergyIds,
            'allergy claim',
          ),
        );
        n.unlocks.forEach((u, k) =>
          need(
            EVIDENCE,
            ['dialogueTrees', i, 'nodes', j, 'unlocks', k],
            u,
            local,
            'dialogue node (same tree)',
          ),
        );
      });
    });
    ev.artifacts.forEach((a, i) => {
      need(EVIDENCE, ['artifacts', i, 'sourceId'], a.sourceId, sourceIds, 'source');
      a.labelClaims.forEach((c, k) =>
        need(EVIDENCE, ['artifacts', i, 'labelClaims', k], c, claimIds, 'claim'),
      );
    });
    ev.escalationChannels.forEach((e, i) => {
      e.responseContent.revealsClaimIds.forEach((c, k) =>
        need(
          EVIDENCE,
          ['escalationChannels', i, 'responseContent', 'revealsClaimIds', k],
          c,
          claimIds,
          'claim',
        ),
      );
      e.responseContent.revealsAllergyClaimIds.forEach((c, k) =>
        need(
          EVIDENCE,
          ['escalationChannels', i, 'responseContent', 'revealsAllergyClaimIds', k],
          c,
          allergyIds,
          'allergy claim',
        ),
      );
      if (
        e.institutionId !== undefined &&
        ctx.universe &&
        !ctx.universe.institutionIds.has(e.institutionId)
      )
        out.push(
          finding(
            id,
            'error',
            EVIDENCE,
            ['escalationChannels', i, 'institutionId'],
            `institution "${e.institutionId}" is not in the universe registry`,
          ),
        );
    });

    // Reference-side references and co-requirements.
    const needRef = (path: PathSegment[], ref: string) => {
      const parsed = parseEvidenceRef(ref);
      if (!parsed) return;
      const sets: Record<string, ReadonlySet<string>> = {
        source: sourceIds,
        claim: claimIds,
        'allergy-claim': allergyIds,
        'dialogue-node': nodeIds,
        artifact: artifactIds,
        'escalation-channel': channelIds,
      };
      if (!sets[parsed.kind]?.has(parsed.id))
        out.push(
          finding(
            id,
            'error',
            REFERENCE,
            path,
            `evidence reference "${ref}" does not exist in evidence.yaml`,
          ),
        );
    };
    ref.actualUseState.forEach((u, i) => {
      need(REFERENCE, ['actualUseState', i, 'regimenId'], u.regimenId, regimenIds, 'regimen entry');
      const irreducible = u.knowability.mark === 'irreducibly-uncertain';
      if (irreducible && u.knowability.knowableVia !== undefined)
        out.push(
          finding(
            id,
            'error',
            REFERENCE,
            ['actualUseState', i, 'knowability', 'knowableVia'],
            'irreducibly-uncertain facts carry no knowableVia (D-MED-005)',
          ),
        );
      if (!irreducible && u.knowability.knowableVia === undefined)
        out.push(
          finding(
            id,
            'error',
            REFERENCE,
            ['actualUseState', i, 'knowability', 'knowableVia'],
            `${u.knowability.mark} facts must say how they become knowable (knowableVia)`,
          ),
        );
      u.knowability.knowableVia?.forEach((r, k) =>
        needRef(['actualUseState', i, 'knowability', 'knowableVia', k], r),
      );
    });
    ref.evidenceYield?.forEach((y, i) => needRef(['evidenceYield', i, 'ref'], y.ref));
    ref.discrepancies.forEach((d, i) => {
      d.detectabilityPaths.forEach((p, j) =>
        p.requires.forEach((r, k) =>
          needRef(['discrepancies', i, 'detectabilityPaths', j, 'requires', k], r),
        ),
      );
      d.involves.claimIds?.forEach((c, k) =>
        need(REFERENCE, ['discrepancies', i, 'involves', 'claimIds', k], c, claimIds, 'claim'),
      );
      d.involves.allergyClaimIds?.forEach((c, k) =>
        need(
          REFERENCE,
          ['discrepancies', i, 'involves', 'allergyClaimIds', k],
          c,
          allergyIds,
          'allergy claim',
        ),
      );
      need(
        REFERENCE,
        ['discrepancies', i, 'involves', 'regimenId'],
        d.involves.regimenId,
        regimenIds,
        'regimen entry',
      );
      need(
        REFERENCE,
        ['discrepancies', i, 'involves', 'actualUseId'],
        d.involves.actualUseId,
        actualUseIds,
        'actual-use entry',
      );
      need(
        REFERENCE,
        ['discrepancies', i, 'teachingNoteId'],
        d.teachingNoteId,
        teachingIds,
        'teaching-note ref',
      );
      if (d.scoring === 'discussion-item-not-scored' && d.freezeNoteText === undefined)
        out.push(
          finding(
            id,
            'error',
            REFERENCE,
            ['discrepancies', i, 'freezeNoteText'],
            'a frozen item needs freezeNoteText (D-RISK-004)',
          ),
        );
    });
    const entries = [
      ...ref.actionSets.accepted.map((e, i) => ({
        e,
        path: ['actionSets', 'accepted', i] as PathSegment[],
      })),
      ...ref.actionSets.partiallyAccepted.map((e, i) => ({
        e,
        path: ['actionSets', 'partiallyAccepted', i] as PathSegment[],
      })),
      ...ref.actionSets.unsafe.map((e, i) => ({
        e,
        path: ['actionSets', 'unsafe', i] as PathSegment[],
      })),
    ];
    for (const { e, path } of entries) {
      need(
        REFERENCE,
        [...path, 'target', 'discrepancyId'],
        e.target.discrepancyId,
        discrepancyIds,
        'discrepancy',
      );
      if (e.scoring === 'discussion-item-not-scored' && e.freezeNoteText === undefined)
        out.push(
          finding(
            id,
            'error',
            REFERENCE,
            [...path, 'freezeNoteText'],
            'a frozen item needs freezeNoteText (D-RISK-004)',
          ),
        );
    }
    ref.expectedEscalations.forEach((x, i) => {
      need(
        REFERENCE,
        ['expectedEscalations', i, 'channelId'],
        x.channelId,
        channelIds,
        'escalation channel',
      );
      x.discrepancyIds?.forEach((d, k) =>
        need(
          REFERENCE,
          ['expectedEscalations', i, 'discrepancyIds', k],
          d,
          discrepancyIds,
          'discrepancy',
        ),
      );
    });
    ref.hints.forEach((h, i) => {
      need(
        REFERENCE,
        ['hints', i, 'targetDiscrepancyId'],
        h.targetDiscrepancyId,
        discrepancyIds,
        'discrepancy',
      );
      needRef(['hints', i, 'revealSource', 'sourceRef'], h.revealSource.sourceRef);
    });

    if (reviewRecord) {
      if (
        reviewRecord.disposition === 'approved-with-changes' &&
        reviewRecord.changesMade.length === 0
      )
        out.push(
          finding(
            id,
            'error',
            REVIEW,
            ['changesMade'],
            'approved-with-changes requires changesMade',
          ),
        );
      if (reviewRecord.disposition === 'frozen-items' && reviewRecord.frozenItems.length === 0)
        out.push(
          finding(id, 'error', REVIEW, ['frozenItems'], 'frozen-items requires frozenItems'),
        );
    }
    return out;
  },
};

// ---------------------------------------------------------------- INV-VERS-001 --
export const INV_VERS_001: CaseInvariant = {
  id: 'INV-VERS-001',
  run(bundle, _input, ctx) {
    const out: Finding[] = [];
    const stamps: [string, string][] = [
      [CASE, bundle.case.schemaVersion],
      [EVIDENCE, bundle.evidence.schemaVersion],
      [REFERENCE, bundle.reference.schemaVersion],
      [CITATIONS, bundle.citations.schemaVersion],
    ];
    if (bundle.reviewRecord) stamps.push([REVIEW, bundle.reviewRecord.schemaVersion]);
    for (const [file, stamp] of stamps) {
      if (stamp !== SCHEMA_VERSION)
        out.push(
          finding(
            this.id,
            'error',
            file,
            ['schemaVersion'],
            `schemaVersion "${stamp}" does not match the schema package (${SCHEMA_VERSION}); re-stamp via the codemod (D-DATA-002)`,
          ),
        );
    }
    if (ctx.formulary && !versionInRange(ctx.formulary.version, bundle.case.formularyVersionRange))
      out.push(
        finding(
          this.id,
          'error',
          CASE,
          ['formularyVersionRange'],
          `formulary ${ctx.formulary.version} is outside the declared range`,
        ),
      );
    if (
      ctx.universe &&
      bundle.case.universeVersionRange &&
      !versionInRange(ctx.universe.version, bundle.case.universeVersionRange)
    )
      out.push(
        finding(
          this.id,
          'error',
          CASE,
          ['universeVersionRange'],
          `universe ${ctx.universe.version} is outside the declared range`,
        ),
      );
    return out;
  },
};

// ---------------------------------------------------------------- INV-TIME-001 --
export const INV_TIME_001: CaseInvariant = {
  id: 'INV-TIME-001',
  run(bundle) {
    const out: Finding[] = [];
    const t0 = bundle.evidence.T0;
    if (resolveSimTime('T0', t0) === null) {
      out.push(finding(this.id, 'error', EVIDENCE, ['T0'], `T0 "${t0}" is not a valid instant`));
      return out;
    }
    const checkPair = (path: PathSegment[], eventTime: string, documentationTime: string) => {
      const ev = resolveSimTime(eventTime, t0);
      const doc = resolveSimTime(documentationTime, t0);
      if (!ev)
        out.push(
          finding(
            this.id,
            'error',
            EVIDENCE,
            [...path, 'eventTime'],
            `unresolvable time "${eventTime}"`,
          ),
        );
      if (!doc)
        out.push(
          finding(
            this.id,
            'error',
            EVIDENCE,
            [...path, 'documentationTime'],
            `unresolvable time "${documentationTime}"`,
          ),
        );
      if (ev && doc && doc.getTime() < ev.getTime())
        out.push(
          finding(
            this.id,
            'error',
            EVIDENCE,
            [...path, 'documentationTime'],
            `documentationTime (${documentationTime}) is before eventTime (${eventTime}); documentation never precedes the event (D-MED-002)`,
          ),
        );
    };
    bundle.evidence.claims.forEach((c, i) =>
      checkPair(['claims', i], c.eventTime, c.documentationTime),
    );
    bundle.evidence.allergyClaims.forEach((a, i) =>
      checkPair(['allergyClaims', i], a.eventTime, a.documentationTime),
    );
    const checkOne = (file: string, path: PathSegment[], value: string | undefined) => {
      if (value !== undefined && resolveSimTime(value, t0) === null)
        out.push(finding(this.id, 'error', file, path, `unresolvable time "${value}"`));
    };
    bundle.evidence.sources.forEach((s, i) =>
      checkOne(EVIDENCE, ['sources', i, 'availableFrom'], s.availableFrom),
    );
    bundle.reference.actualUseState.forEach((u, i) =>
      checkOne(REFERENCE, ['actualUseState', i, 'lastTakenTime'], u.lastTakenTime),
    );
    bundle.reference.expectedEscalations.forEach((x, i) =>
      checkOne(REFERENCE, ['expectedEscalations', i, 'byTime'], x.byTime),
    );
    return out;
  },
};

// ---------------------------------------------------------------- INV-REF-001 --
interface MedRefLike {
  formularyId?: string | undefined;
  unresolvedLabel?: { sanctioned: true; reason: string; text: string } | undefined;
}

export function checkMedicationRef(
  invariant: string,
  file: string,
  path: readonly PathSegment[],
  ref: MedRefLike,
  ctx: ValidationContext,
  optional: boolean,
): Finding[] {
  const out: Finding[] = [];
  const has = ref.formularyId !== undefined;
  const hasLabel = ref.unresolvedLabel !== undefined;
  if (has && hasLabel)
    out.push(
      finding(
        invariant,
        'error',
        file,
        path,
        'exactly one of formularyId / unresolvedLabel is allowed (D-DATA-004, T-2)',
      ),
    );
  else if (!has && !hasLabel && !optional)
    out.push(
      finding(
        invariant,
        'error',
        file,
        path,
        'a medication needs a formularyId or a sanctioned unresolvedLabel (D-DATA-004, T-2)',
      ),
    );
  if (has) {
    if (!ctx.formulary)
      out.push(
        finding(
          invariant,
          'error',
          file,
          [...path, 'formularyId'],
          'no formulary package loaded to resolve against',
        ),
      );
    else if (!ctx.formulary.entries.has(ref.formularyId as string))
      out.push(
        finding(
          invariant,
          'error',
          file,
          [...path, 'formularyId'],
          `formularyId "${ref.formularyId}" does not resolve in the formulary package`,
        ),
      );
  }
  return out;
}

export const INV_REF_001: CaseInvariant = {
  id: 'INV-REF-001',
  run(bundle, _input, ctx) {
    const out: Finding[] = [];
    const id = this.id;
    bundle.evidence.claims.forEach((c, i) =>
      out.push(...checkMedicationRef(id, EVIDENCE, ['claims', i], c, ctx, false)),
    );
    bundle.evidence.allergyClaims.forEach((a, i) => {
      if ('agent' in a && a.agent.kind === 'formulary')
        out.push(
          ...checkMedicationRef(
            id,
            EVIDENCE,
            ['allergyClaims', i, 'agent'],
            { formularyId: a.agent.formularyId },
            ctx,
            false,
          ),
        );
    });
    bundle.reference.referenceRegimen.forEach((r, i) =>
      out.push(...checkMedicationRef(id, REFERENCE, ['referenceRegimen', i], r, ctx, false)),
    );
    bundle.reference.actualUseState.forEach((u, i) =>
      out.push(...checkMedicationRef(id, REFERENCE, ['actualUseState', i], u, ctx, false)),
    );
    bundle.reference.discrepancies.forEach((d, i) =>
      out.push(
        ...checkMedicationRef(
          id,
          REFERENCE,
          ['discrepancies', i, 'involves'],
          d.involves,
          ctx,
          true,
        ),
      ),
    );
    const sets = bundle.reference.actionSets;
    sets.accepted.forEach((e, i) =>
      out.push(
        ...checkMedicationRef(
          id,
          REFERENCE,
          ['actionSets', 'accepted', i, 'target'],
          e.target,
          ctx,
          true,
        ),
      ),
    );
    sets.partiallyAccepted.forEach((e, i) =>
      out.push(
        ...checkMedicationRef(
          id,
          REFERENCE,
          ['actionSets', 'partiallyAccepted', i, 'target'],
          e.target,
          ctx,
          true,
        ),
      ),
    );
    sets.unsafe.forEach((e, i) =>
      out.push(
        ...checkMedicationRef(
          id,
          REFERENCE,
          ['actionSets', 'unsafe', i, 'target'],
          e.target,
          ctx,
          true,
        ),
      ),
    );
    return out;
  },
};

// ---------------------------------------------------------------- INV-TRUTH-001 --
/**
 * Data-level half of layer separation: no reference-layer id may appear anywhere in
 * evidence.yaml (the type-level half is tsconfig.evidence.json; the top-level-key half is
 * attributed from the strict evidence schema).
 */
export const INV_TRUTH_001: CaseInvariant = {
  id: 'INV-TRUTH-001',
  run(bundle, input) {
    const out: Finding[] = [];
    const ref = bundle.reference;
    const referenceIds = new Set<string>([
      ...ref.referenceRegimen.map((r) => r.id),
      ...ref.actualUseState.map((u) => u.id),
      ...ref.discrepancies.map((d) => d.id),
      ...ref.actionSets.rationaleMenu.map((m) => m.key),
      ...ref.actionSets.accepted.map((e) => e.id),
      ...ref.actionSets.partiallyAccepted.map((e) => e.id),
      ...ref.actionSets.unsafe.map((e) => e.id),
      ...ref.expectedEscalations.map((x) => x.id),
      ...ref.hints.map((h) => h.id),
      ...ref.teachingNoteRefs.map((t) => t.id),
    ]);
    const idRe = new RegExp(
      `\\b(?:${REFERENCE_ID_PREFIXES.join('|')})-[a-z0-9]+(?:-[a-z0-9]+)*\\b`,
      'g',
    );
    const raw = input.files.get(EVIDENCE)?.data;
    walkStrings(raw, (value, path) => {
      for (const m of value.matchAll(idRe)) {
        if (referenceIds.has(m[0]))
          out.push(
            finding(
              this.id,
              'error',
              EVIDENCE,
              path,
              `reference-layer id "${m[0]}" leaks into the evidence layer (D-MED-005)`,
            ),
          );
      }
    });
    return out;
  },
};

// ---------------------------------------------------------------- INV-DISC-001 --
export const INV_DISC_001: CaseInvariant = {
  id: 'INV-DISC-001',
  run(bundle) {
    const out: Finding[] = [];
    bundle.reference.discrepancies.forEach((d, i) => {
      // The five axes, the ordinals and ≥1 path are schema-required (attributed here on
      // failure); the checks below are the ones the schema cannot express.
      if (d.detectabilityPaths.length === 0)
        out.push(
          finding(
            this.id,
            'error',
            REFERENCE,
            ['discrepancies', i, 'detectabilityPaths'],
            'at least one detectability path is required',
          ),
        );
      if (d.secondaryMechanisms?.includes(d.mechanism))
        out.push(
          finding(
            this.id,
            'error',
            REFERENCE,
            ['discrepancies', i, 'secondaryMechanisms'],
            `primary mechanism "${d.mechanism}" repeated as a secondary mechanism`,
          ),
        );
      const seen = new Set<string>();
      d.detectabilityPaths.forEach((p, j) => {
        const key = `${p.detectability}|${[...p.requires].sort().join(',')}`;
        if (seen.has(key))
          out.push(
            finding(
              this.id,
              'warning',
              REFERENCE,
              ['discrepancies', i, 'detectabilityPaths', j],
              'duplicate detectability path',
            ),
          );
        seen.add(key);
      });
      if (
        d.type === 'allergy-record-discrepancy' &&
        (d.involves.allergyClaimIds?.length ?? 0) === 0
      )
        out.push(
          finding(
            this.id,
            'warning',
            REFERENCE,
            ['discrepancies', i, 'involves', 'allergyClaimIds'],
            'allergy-record-discrepancy normally names the allergy claims involved',
          ),
        );
      if (d.acceptedClassifications?.some((c) => c.type === d.type && c.mechanism === d.mechanism))
        out.push(
          finding(
            this.id,
            'warning',
            REFERENCE,
            ['discrepancies', i, 'acceptedClassifications'],
            'the primary classification is accepted implicitly; listing it again is redundant',
          ),
        );
    });
    return out;
  },
};

// ---------------------------------------------------------------- INV-ACT-001 --
interface LintScope {
  file: string;
  path: readonly PathSegment[];
  text: string;
  cited: boolean;
  /** true when numbers in this text need no citation carrier (e.g. hints). */
  numbersExempt?: boolean;
  allowInevitability?: boolean;
}

export function lintScopes(invariant: string, scopes: readonly LintScope[]): Finding[] {
  const out: Finding[] = [];
  for (const s of scopes) {
    const r = lintHarmLanguage(s.text);
    if (r.probabilityToken)
      out.push(
        finding(
          invariant,
          'error',
          s.file,
          s.path,
          `harm-language lint: probability/statistic token "${r.probabilityToken}" — use plausible-consequence phrasing with ordinal severity (D-SCOR-003)`,
        ),
      );
    if (r.inevitabilityToken && !s.allowInevitability)
      out.push(
        finding(
          invariant,
          'error',
          s.file,
          s.path,
          `harm-language lint: inevitability wording "${r.inevitabilityToken}" without inevitabilityAuthored: true (D-SCOR-003)`,
        ),
      );
    if (r.hasNumber && !s.cited && !s.numbersExempt)
      out.push(
        finding(
          invariant,
          'error',
          s.file,
          s.path,
          'harm-language lint: a number in teaching text needs a citation reference on this entry (D-SCOR-003; CITATION-POLICY §1)',
        ),
      );
  }
  return out;
}

export const INV_ACT_001: CaseInvariant = {
  id: 'INV-ACT-001',
  run(bundle) {
    const out: Finding[] = [];
    const sets = bundle.reference.actionSets;
    const menu = new Map(sets.rationaleMenu.map((m) => [m.key, m]));
    if (sets.accepted.length === 0)
      out.push(
        finding(
          this.id,
          'error',
          REFERENCE,
          ['actionSets', 'accepted'],
          'the accepted set must be non-empty (D-SCOR-002)',
        ),
      );

    const scopes: LintScope[] = [];
    sets.rationaleMenu.forEach((m, i) =>
      scopes.push({
        file: REFERENCE,
        path: ['actionSets', 'rationaleMenu', i, 'text'],
        text: m.text,
        cited: (m.citations?.length ?? 0) > 0,
      }),
    );
    const invariant = this.id;
    // Common checks for one entry; returns whether the entry (or its menu item) is cited.
    const baseChecks = (e: z.infer<typeof AcceptedEntry>, path: PathSegment[]): boolean => {
      const menuItem = e.rationaleKey !== undefined ? menu.get(e.rationaleKey) : undefined;
      if (e.rationaleKey !== undefined && menuItem === undefined)
        out.push(
          finding(
            invariant,
            'error',
            REFERENCE,
            [...path, 'rationaleKey'],
            `rationaleKey "${e.rationaleKey}" is not in rationaleMenu`,
          ),
        );
      if (e.rationaleKey === undefined && e.rationaleText === undefined)
        out.push(
          finding(
            invariant,
            'error',
            REFERENCE,
            path,
            'every action-set entry carries a rationale (rationaleKey or rationaleText) (D-SCOR-002)',
          ),
        );
      const cited = (e.citations?.length ?? 0) > 0 || (menuItem?.citations?.length ?? 0) > 0;
      if (e.rationaleText !== undefined)
        scopes.push({
          file: REFERENCE,
          path: [...path, 'rationaleText'],
          text: e.rationaleText,
          cited,
        });
      return cited;
    };
    sets.accepted.forEach((e, i) => baseChecks(e, ['actionSets', 'accepted', i]));
    sets.partiallyAccepted.forEach((e, i) => {
      const path: PathSegment[] = ['actionSets', 'partiallyAccepted', i];
      const cited = baseChecks(e, path);
      scopes.push({
        file: REFERENCE,
        path: [...path, 'shortfallText'],
        text: e.shortfallText,
        cited,
      });
    });
    sets.unsafe.forEach((e, i) => {
      const path: PathSegment[] = ['actionSets', 'unsafe', i];
      const cited = baseChecks(e, path);
      const moh = e.mechanismOfHarm;
      scopes.push({
        file: REFERENCE,
        path: [...path, 'mechanismOfHarm', 'text'],
        text: moh.text,
        cited: cited || (moh.citations?.length ?? 0) > 0,
        allowInevitability: moh.inevitabilityAuthored,
      });
    });
    bundle.reference.discrepancies.forEach((d, i) =>
      scopes.push({
        file: REFERENCE,
        path: ['discrepancies', i, 'resolutionExpectation', 'detailText'],
        text: d.resolutionExpectation.detailText,
        cited: (d.citations?.length ?? 0) > 0,
      }),
    );
    bundle.reference.expectedEscalations.forEach((x, i) =>
      scopes.push({
        file: REFERENCE,
        path: ['expectedEscalations', i, 'whyText'],
        text: x.whyText,
        cited: (x.citations?.length ?? 0) > 0,
      }),
    );
    bundle.reference.hints.forEach((h, i) => {
      scopes.push({
        file: REFERENCE,
        path: ['hints', i, 'nudge', 'text'],
        text: h.nudge.text,
        cited: false,
        numbersExempt: true,
      });
      scopes.push({
        file: REFERENCE,
        path: ['hints', i, 'directed', 'text'],
        text: h.directed.text,
        cited: false,
        numbersExempt: true,
      });
      scopes.push({
        file: REFERENCE,
        path: ['hints', i, 'revealSource', 'text'],
        text: h.revealSource.text,
        cited: false,
        numbersExempt: true,
      });
    });
    bundle.reference.teachingNoteRefs.forEach((t, i) =>
      scopes.push({
        file: REFERENCE,
        path: ['teachingNoteRefs', i, 'summaryText'],
        text: t.summaryText,
        cited: t.citations.length > 0,
      }),
    );
    out.push(...lintScopes(this.id, scopes));
    return out;
  },
};

// ---------------------------------------------------------------- INV-META-001 --
export const INV_META_001: CaseInvariant = {
  id: 'INV-META-001',
  run(bundle, input) {
    const out: Finding[] = [];
    const c = bundle.case;
    const ref = bundle.reference;

    for (const [file, value] of [
      [EVIDENCE, bundle.evidence.caseId],
      [REFERENCE, ref.caseId],
    ] as const) {
      if (value !== c.id)
        out.push(
          finding(
            this.id,
            'error',
            file,
            ['caseId'],
            `caseId "${value}" does not match case.yaml id "${c.id}"`,
          ),
        );
    }
    if (bundle.citations.bundleId !== c.id)
      out.push(
        finding(
          this.id,
          'error',
          CITATIONS,
          ['bundleId'],
          `bundleId "${bundle.citations.bundleId}" does not match case.yaml id "${c.id}"`,
        ),
      );
    if (!input.dirName.startsWith('_') && input.dirName !== c.id && input.dirName !== c.slug)
      out.push(
        finding(
          this.id,
          'warning',
          CASE,
          ['slug'],
          `bundle directory "${input.dirName}" is neither the id nor the slug`,
        ),
      );

    const setEq = (
      declared: readonly string[],
      actual: ReadonlySet<string>,
      path: PathSegment[],
      what: string,
    ) => {
      const d = new Set(declared);
      for (const x of d)
        if (!actual.has(x))
          out.push(
            finding(
              this.id,
              'error',
              CASE,
              path,
              `coverage declares ${what} "${x}" but no discrepancy carries it`,
            ),
          );
      for (const x of actual)
        if (!d.has(x))
          out.push(
            finding(
              this.id,
              'error',
              CASE,
              path,
              `reference layer carries ${what} "${x}" but coverage does not declare it`,
            ),
          );
    };
    setEq(
      c.coverage.types,
      new Set(ref.discrepancies.map((d) => d.type)),
      ['coverage', 'types'],
      'type',
    );
    setEq(
      c.coverage.mechanisms,
      new Set(ref.discrepancies.map((d) => d.mechanism)),
      ['coverage', 'mechanisms'],
      'mechanism',
    );
    const hasAllergy = ref.discrepancies.some((d) => d.type === 'allergy-record-discrepancy');
    if (c.coverage.allergySubTask !== hasAllergy)
      out.push(
        finding(
          this.id,
          'error',
          CASE,
          ['coverage', 'allergySubTask'],
          `allergySubTask is ${c.coverage.allergySubTask} but the reference layer ${hasAllergy ? 'contains' : 'has no'} allergy-record-discrepancy`,
        ),
      );

    if (c.reviewStatus === 'draft-unreviewed') {
      if (c.reviewRecordRef !== undefined || c.preBriefBadge !== undefined)
        out.push(
          finding(
            this.id,
            'error',
            CASE,
            ['reviewStatus'],
            'a draft-unreviewed bundle carries no reviewRecordRef or preBriefBadge',
          ),
        );
      if (bundle.reviewRecord)
        out.push(
          finding(
            this.id,
            'error',
            CASE,
            ['reviewStatus'],
            'review-record.yaml exists but reviewStatus is draft-unreviewed',
          ),
        );
      out.push(
        finding(
          this.id,
          'warning',
          CASE,
          ['reviewStatus'],
          'bundle is an unreviewed draft — validates, but is not publishable (D-GOV-001)',
        ),
      );
    } else {
      if (c.reviewRecordRef === undefined)
        out.push(
          finding(
            this.id,
            'error',
            CASE,
            ['reviewRecordRef'],
            'a reviewed bundle needs reviewRecordRef',
          ),
        );
      if (c.preBriefBadge === undefined)
        out.push(
          finding(
            this.id,
            'error',
            CASE,
            ['preBriefBadge'],
            'a reviewed bundle needs preBriefBadge (D-RISK-003)',
          ),
        );
      const r = bundle.reviewRecord;
      if (!r)
        out.push(
          finding(
            this.id,
            'error',
            CASE,
            ['reviewRecordRef'],
            'review-record.yaml is missing or did not parse',
          ),
        );
      else {
        if (r.bundleId !== c.id)
          out.push(
            finding(
              this.id,
              'error',
              REVIEW,
              ['bundleId'],
              `bundleId "${r.bundleId}" does not match case id "${c.id}"`,
            ),
          );
        if (r.contentVersionReviewed !== c.contentVersion)
          out.push(
            finding(
              this.id,
              'error',
              REVIEW,
              ['contentVersionReviewed'],
              `record certifies ${r.contentVersionReviewed} but the bundle is ${c.contentVersion}`,
            ),
          );
        if (r.reviewModel !== REVIEW_MODEL)
          out.push(
            finding(
              this.id,
              'error',
              REVIEW,
              ['reviewModel'],
              'reviewModel must be the fixed string',
            ),
          );
        if (r.disposition === 'returned')
          out.push(
            finding(
              this.id,
              'error',
              REVIEW,
              ['disposition'],
              'a returned review does not publish; reviewStatus must stay draft-unreviewed',
            ),
          );
        const b = c.preBriefBadge;
        if (b) {
          if (b.recordVersion !== r.recordVersion)
            out.push(
              finding(
                this.id,
                'error',
                CASE,
                ['preBriefBadge', 'recordVersion'],
                `badge recordVersion ${b.recordVersion} ≠ record ${r.recordVersion}`,
              ),
            );
          if (b.reviewDate !== r.reviewDate)
            out.push(
              finding(
                this.id,
                'error',
                CASE,
                ['preBriefBadge', 'reviewDate'],
                `badge reviewDate ${b.reviewDate} ≠ record ${r.reviewDate}`,
              ),
            );
          if (b.staleAfter !== r.reReview.dueBy)
            out.push(
              finding(
                this.id,
                'error',
                CASE,
                ['preBriefBadge', 'staleAfter'],
                `badge staleAfter ${b.staleAfter} ≠ record reReview.dueBy ${r.reReview.dueBy}`,
              ),
            );
        }
      }
    }
    return out;
  },
};

// ---------------------------------------------------------------- INV-CIT-001 (warn) --
export interface CitationUse {
  file: string;
  path: readonly PathSegment[];
  ids: readonly string[] | undefined;
  what: string;
  /** Scored clinical rules must cite (warn at EP-9, strict at EP-20); others only need resolvable ids. */
  scored: boolean;
}

export function citationChecks(
  invariant: string,
  records: readonly CitationRecord[],
  uses: readonly CitationUse[],
): Finding[] {
  const out: Finding[] = [];
  const byId = new Map(records.map((r) => [r.id, r]));
  const used = new Set<string>();
  for (const u of uses) {
    if (u.ids === undefined || u.ids.length === 0) {
      if (u.scored)
        out.push(
          finding(
            invariant,
            'warning',
            u.file,
            u.path,
            `${u.what} has no citation (D-GOV-002; strict at EP-20)`,
          ),
        );
      continue;
    }
    let hasAB = false;
    for (const id of u.ids) {
      const rec = byId.get(id);
      if (!rec) {
        out.push(
          finding(
            invariant,
            'error',
            u.file,
            u.path,
            `citation "${id}" does not resolve in citations.yaml`,
          ),
        );
        continue;
      }
      used.add(id);
      if (rec.tier === 'A' || rec.tier === 'B') hasAB = true;
    }
    if (!hasAB && u.scored)
      out.push(
        finding(
          invariant,
          'warning',
          u.file,
          u.path,
          `${u.what} cites no Tier A or B source (policy §2; strict at EP-20)`,
        ),
      );
  }
  records.forEach((r, i) => {
    if (!used.has(r.id))
      out.push(
        finding(
          invariant,
          'warning',
          CITATIONS,
          ['citations', i],
          `citation "${r.id}" is cited nowhere in the bundle`,
        ),
      );
  });
  return out;
}

export const INV_CIT_001: CaseInvariant = {
  id: 'INV-CIT-001',
  run(bundle) {
    const ref = bundle.reference;
    const menu = new Map(ref.actionSets.rationaleMenu.map((m) => [m.key, m]));
    const uses: CitationUse[] = [];
    ref.discrepancies.forEach((d, i) =>
      uses.push({
        file: REFERENCE,
        path: ['discrepancies', i],
        ids: d.citations,
        what: `discrepancy ${d.id}`,
        scored: true,
      }),
    );
    ref.actionSets.rationaleMenu.forEach((m, i) =>
      uses.push({
        file: REFERENCE,
        path: ['actionSets', 'rationaleMenu', i],
        ids: m.citations,
        what: `rationale ${m.key}`,
        scored: false,
      }),
    );
    const entryUse = (band: string, e: z.infer<typeof AcceptedEntry>, i: number) => {
      const ids = [
        ...(e.citations ?? []),
        ...((e.rationaleKey !== undefined ? menu.get(e.rationaleKey)?.citations : undefined) ?? []),
      ];
      uses.push({
        file: REFERENCE,
        path: ['actionSets', band, i],
        ids,
        what: `${band} action ${e.id}`,
        scored: true,
      });
    };
    ref.actionSets.accepted.forEach((e, i) => entryUse('accepted', e, i));
    ref.actionSets.partiallyAccepted.forEach((e, i) => entryUse('partiallyAccepted', e, i));
    ref.actionSets.unsafe.forEach((e, i) => {
      entryUse('unsafe', e, i);
      if (e.mechanismOfHarm.citations)
        uses.push({
          file: REFERENCE,
          path: ['actionSets', 'unsafe', i, 'mechanismOfHarm'],
          ids: e.mechanismOfHarm.citations,
          what: `mechanism of harm for ${e.id}`,
          scored: true,
        });
    });
    ref.expectedEscalations.forEach((x, i) =>
      uses.push({
        file: REFERENCE,
        path: ['expectedEscalations', i],
        ids: x.citations,
        what: `expected escalation ${x.id}`,
        scored: true,
      }),
    );
    ref.teachingNoteRefs.forEach((t, i) =>
      uses.push({
        file: REFERENCE,
        path: ['teachingNoteRefs', i],
        ids: t.citations,
        what: `teaching note ${t.id}`,
        scored: true,
      }),
    );
    if (bundle.reviewRecord)
      uses.push({
        file: REVIEW,
        path: ['sourcesVerified'],
        ids: bundle.reviewRecord.sourcesVerified,
        what: 'sourcesVerified',
        scored: false,
      });
    return citationChecks(this.id, bundle.citations.citations, uses);
  },
};

// ---------------------------------------------------------------- INV-REG-001 --
export function registryChecks(
  invariant: string,
  records: readonly CitationRecord[],
  ctx: ValidationContext,
): Finding[] {
  const out: Finding[] = [];
  if (!ctx.citationRegistryKeys || !ctx.citationPolicyKeys) {
    if (records.length > 0)
      out.push(
        finding(
          invariant,
          'warning',
          CITATIONS,
          [],
          'citation registry / policy pointer list not loaded; registry-row check skipped',
        ),
      );
    return out;
  }
  records.forEach((r, i) => {
    if (!ctx.citationRegistryKeys?.has(r.source))
      out.push(
        finding(
          invariant,
          'error',
          CITATIONS,
          ['citations', i, 'source'],
          `source key "${r.source}" has no row in source material/REGISTRY.md (D-DATA-006)`,
        ),
      );
    if (!ctx.citationPolicyKeys?.has(r.source))
      out.push(
        finding(
          invariant,
          'error',
          CITATIONS,
          ['citations', i, 'source'],
          `source key "${r.source}" is not in CITATION-POLICY.md §7`,
        ),
      );
  });
  return out;
}

export const INV_REG_001: CaseInvariant = {
  id: 'INV-REG-001',
  run(bundle, _input, ctx) {
    return registryChecks(this.id, bundle.citations.citations, ctx);
  },
};

// ---------------------------------------------------------------- INV-SCOPE-001 (partial) --
export function brandDenylistChecks(invariant: string, file: string, data: unknown): Finding[] {
  const out: Finding[] = [];
  walkStrings(data, (value, path) => {
    const hit = findRealBrandName(value);
    if (hit)
      out.push(
        finding(
          invariant,
          'error',
          file,
          path,
          `real brand name "${hit}" is not allowed in content (D-DATA-001; fictional coinages only)`,
        ),
      );
  });
  return out;
}

/**
 * Visibly fictional identifiers (EP-10; ORIGINALITY-CHECKLIST.md §4): no ten-digit phone number
 * outside 555-01XX and no NPI-labelled number that passes the real check-digit test, anywhere
 * in authored text.
 */
export function realLookingIdentifierChecks(
  invariant: string,
  file: string,
  data: unknown,
): Finding[] {
  const out: Finding[] = [];
  walkStrings(data, (value, path) => {
    for (const hit of findRealLookingIdentifiers(value))
      out.push(
        finding(
          invariant,
          'error',
          file,
          path,
          hit.kind === 'phone'
            ? `phone number "${hit.value}" is not in the fictional 555-01XX range`
            : `NPI ${hit.value} could pass as real (synthetic NPIs start with 0 and fail the check digit)`,
        ),
      );
  });
  return out;
}

export const INV_SCOPE_001: CaseInvariant = {
  id: 'INV-SCOPE-001',
  run(_bundle, input) {
    const out: Finding[] = [];
    for (const name of [CASE, EVIDENCE, REFERENCE]) {
      const f = input.files.get(name);
      if (f) {
        out.push(...brandDenylistChecks(this.id, name, f.data));
        out.push(...realLookingIdentifierChecks(this.id, name, f.data));
      }
    }
    return out;
  },
};

/** The EP-9 core subset, in run order. */
export const CASE_INVARIANTS: readonly CaseInvariant[] = [
  INV_SHAPE_001,
  INV_VERS_001,
  INV_TIME_001,
  INV_REF_001,
  INV_TRUTH_001,
  INV_DISC_001,
  INV_ACT_001,
  INV_META_001,
  INV_CIT_001,
  INV_REG_001,
  INV_SCOPE_001,
];
