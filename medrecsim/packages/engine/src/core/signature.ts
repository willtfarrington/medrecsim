// SPDX-License-Identifier: MIT
/**
 * The signature gate (D-WF-004; EP-12a, the owner's reading recorded as D-WF-005). A case ends by
 * the learner's explicit signature, and the signature is refused until:
 *
 * - every medication the learner has seen carries a status — an admission-action line, where
 *   `unable-to-verify` and `defer-with-plan` are first-class statuses (`medication-without-status`,
 *   one reason per medication);
 * - no discrepancy-log entry is left open — an unresolved discrepancy needs an escalation or a
 *   documented rationale (`discrepancy-unresolved`, one per entry);
 * - every entry marked escalated names a channel the learner actually escalated to; any attempt
 *   counts, whatever its outcome (`escalation-not-initiated`, one per entry).
 *
 * The gate reads the evidence index and the folded state only, so it compiles in the engine's
 * evidence-only project. The reducer applies it to every `sign` — through `session.sign()` and
 * in a replay — so a stored log whose signature came before a complete workspace no longer
 * replays and is discarded at restore. There is no time-out and nothing else blocks: what the
 * learner left unexamined is for the debrief and the subscores to show, not for the gate.
 */
import type { MedKey } from './actions.ts';
import type { EvidenceIndex } from './evidence-index.ts';
import { visibleMedications, type SessionState } from './state.ts';

export const SIGNATURE_BLOCK_CODES = [
  'already-signed',
  'medication-without-status',
  'discrepancy-unresolved',
  'escalation-not-initiated',
] as const;
export type SignatureBlockCode = (typeof SIGNATURE_BLOCK_CODES)[number];

/** One structured reason the case cannot be signed yet; the UI points at the named line. */
export type SignatureBlock =
  | { readonly code: 'already-signed'; readonly message: string }
  | {
      readonly code: 'medication-without-status';
      readonly message: string;
      readonly medKey: MedKey;
    }
  | {
      readonly code: 'discrepancy-unresolved';
      readonly message: string;
      readonly entryId: string;
      readonly medKey: MedKey;
    }
  | {
      readonly code: 'escalation-not-initiated';
      readonly message: string;
      readonly entryId: string;
      readonly medKey: MedKey;
      readonly channelId: string;
    };

export interface SignatureCheck {
  readonly ready: boolean;
  readonly blocking: readonly SignatureBlock[];
}

export const ALREADY_SIGNED: SignatureBlock = {
  code: 'already-signed',
  message: 'the case has already been signed',
};

/**
 * The D-WF-004 checks over an unsigned state, in a stable order: medications in the evidence
 * layer's first-appearance order, then discrepancy-log entries in log order.
 */
export function checkSignature(index: EvidenceIndex, state: SessionState): SignatureCheck {
  if (state.signedAtMinutes !== null) return { ready: false, blocking: [ALREADY_SIGNED] };
  const blocking: SignatureBlock[] = [];
  const { actionList, discrepancyLog } = state.workspace;

  for (const med of visibleMedications(index, state)) {
    if (!actionList.some((a) => a.medKey === med.medKey)) {
      blocking.push({
        code: 'medication-without-status',
        message: `${med.medKey} has no admission-action line; every medication needs a status (unable to verify and defer with plan count)`,
        medKey: med.medKey,
      });
    }
  }

  for (const entry of discrepancyLog) {
    const r = entry.resolution;
    if (r.kind === 'open') {
      blocking.push({
        code: 'discrepancy-unresolved',
        message: `discrepancy entry ${entry.entryId} is open; resolve it with a rationale or escalate it`,
        entryId: entry.entryId,
        medKey: entry.medKey,
      });
    } else if (
      r.kind === 'escalated' &&
      !state.escalations.some((e) => e.channelId === r.channelId)
    ) {
      blocking.push({
        code: 'escalation-not-initiated',
        message: `discrepancy entry ${entry.entryId} is marked escalated to ${r.channelId}, but no escalation to ${r.channelId} was initiated`,
        entryId: entry.entryId,
        medKey: entry.medKey,
        channelId: r.channelId,
      });
    }
  }

  return { ready: blocking.length === 0, blocking };
}
