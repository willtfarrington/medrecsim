// SPDX-License-Identifier: MIT
/**
 * Typed engine errors. The reducer never throws: every rejected action comes back as a
 * `Result` carrying an `EngineError` with a closed `code` set, so the UI can branch on the
 * code and a stored log that no longer replays is discarded politely (D-ARCH-005, I-4).
 */

export const ENGINE_ERROR_CODES = [
  // Session lifecycle
  'session-signed',
  'sign-via-seam',
  'not-implemented',
  'unknown-action',
  'malformed-action',
  // Sources and artifacts
  'unknown-source',
  'source-already-opened',
  'source-not-yet-available',
  'source-not-opened',
  'unknown-artifact',
  'artifact-already-examined',
  // Dialogue
  'unknown-dialogue-node',
  'dialogue-node-locked',
  'dialogue-node-already-asked',
  // Escalation
  'unknown-escalation-channel',
  'escalation-already-pending',
  'no-pending-escalation',
  // Workspace
  'unknown-medication',
  'claim-not-visible',
  'unknown-rationale',
  'unknown-workspace-entry',
  'invalid-entry',
  // D-MED-002 fence
  'post-t0-mutation',
] as const;
export type EngineErrorCode = (typeof ENGINE_ERROR_CODES)[number];

export type ErrorDetailValue = string | number | boolean | null;

export interface EngineError {
  readonly code: EngineErrorCode;
  readonly message: string;
  readonly details: Readonly<Record<string, ErrorDetailValue>>;
}

export type Result<T> =
  { readonly ok: true; readonly value: T } | { readonly ok: false; readonly error: EngineError };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(
  code: EngineErrorCode,
  message: string,
  details: Readonly<Record<string, ErrorDetailValue>> = {},
): Result<T> {
  return { ok: false, error: { code, message, details } };
}
