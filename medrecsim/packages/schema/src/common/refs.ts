// SPDX-License-Identifier: MIT
/**
 * Evidence references — compact `kind:id` strings that the reference layer uses to point at
 * learner-observable evidence units (detectability paths, knowable-via lists, yield tags).
 * The direction is reference → evidence only; evidence types never carry these (D-MED-005).
 */
import { z } from 'zod';
import { EVIDENCE_REF_KINDS, type EvidenceRefKind } from '../vocab/model.ts';
import { KEBAB_RE } from './ids.ts';

const EVIDENCE_REF_RE = new RegExp(
  `^(${EVIDENCE_REF_KINDS.join('|')}):([a-z][a-z0-9]*(?:-[a-z0-9]+)*)$`,
);

export const EvidenceRef = z
  .string()
  .regex(EVIDENCE_REF_RE, 'kind:id where kind is an evidence-unit kind')
  .describe(
    'Reference to an evidence unit as kind:id, e.g. source:src-pharmacy, claim:clm-amlo-1, dialogue-node:q-otc, artifact:art-bottle-1, escalation-channel:esc-pcp',
  );
export type EvidenceRef = z.infer<typeof EvidenceRef>;

export function parseEvidenceRef(ref: string): { kind: EvidenceRefKind; id: string } | null {
  const m = EVIDENCE_REF_RE.exec(ref);
  if (!m || !m[1] || !m[2] || !KEBAB_RE.test(m[2])) return null;
  return { kind: m[1] as EvidenceRefKind, id: m[2] };
}
