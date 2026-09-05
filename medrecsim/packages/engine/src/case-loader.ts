// SPDX-License-Identifier: MIT
/**
 * Case loader: accepts one compiled JSON chunk (`cases/<id>.json`, written by the content
 * CLI's `compile` — ADR-3) and returns a typed `CompiledCase`. The chunk was schema-validated
 * and invariant-checked at compile time, so the loader checks structure and versions only and
 * throws a typed `CaseLoadError` on anything it cannot accept (D-DATA-002: the app supports
 * exactly one schema major).
 *
 * This is the one engine module that holds the reference layer (for EP-12's scoring,
 * signature and debrief). The session keeps it behind the seam; the projection never sees it.
 */
import type {
  CaseDocument,
  CitationsDocument,
  ReviewRecordDocument,
} from '@medrecsim/schema/documents';
import type { EvidenceDocument } from '@medrecsim/schema/evidence';
import type { ReferenceDocument } from '@medrecsim/schema/reference';
import { SCHEMA_MAJOR } from '@medrecsim/schema/version';
import { parseIsoToEpochMs } from './core/time.ts';

export interface CompiledCase {
  readonly compiledFrom: string | null;
  /** Fixed UTC offset of the case locale, derived at compile time from the authored T0. */
  readonly caseLocalUtcOffsetMinutes: number;
  readonly case: CaseDocument;
  readonly evidence: EvidenceDocument;
  readonly reference: ReferenceDocument;
  readonly citations: CitationsDocument;
  readonly reviewRecord: ReviewRecordDocument | null;
}

export const CASE_LOAD_ERROR_CODES = [
  'not-an-object',
  'missing-section',
  'missing-offset',
  'schema-major-mismatch',
  'case-id-mismatch',
  'bad-time',
] as const;
export type CaseLoadErrorCode = (typeof CASE_LOAD_ERROR_CODES)[number];

export class CaseLoadError extends Error {
  override readonly name = 'CaseLoadError';
  constructor(
    readonly code: CaseLoadErrorCode,
    message: string,
  ) {
    super(message);
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function section(chunk: Record<string, unknown>, name: string): Record<string, unknown> {
  const v = chunk[name];
  if (!isRecord(v))
    throw new CaseLoadError('missing-section', `compiled case chunk has no "${name}" section`);
  return v;
}

export function loadCompiledCase(chunk: unknown): CompiledCase {
  if (!isRecord(chunk))
    throw new CaseLoadError('not-an-object', 'compiled case chunk is not an object');
  const caseDoc = section(chunk, 'case');
  const evidence = section(chunk, 'evidence');
  const reference = section(chunk, 'reference');
  const citations = section(chunk, 'citations');
  const reviewRaw = chunk['reviewRecord'];
  const reviewRecord = isRecord(reviewRaw) ? (reviewRaw as unknown as ReviewRecordDocument) : null;

  const offset = chunk['caseLocalUtcOffsetMinutes'];
  if (typeof offset !== 'number' || !Number.isInteger(offset) || Math.abs(offset) > 14 * 60) {
    throw new CaseLoadError(
      'missing-offset',
      'compiled case chunk carries no caseLocalUtcOffsetMinutes; re-run `pnpm content:compile` (EP-11 compile output)',
    );
  }

  const stamp = caseDoc['schemaVersion'];
  const major = typeof stamp === 'string' ? Number(stamp.split('.')[0]) : NaN;
  if (major !== SCHEMA_MAJOR) {
    throw new CaseLoadError(
      'schema-major-mismatch',
      `case is stamped schema ${String(stamp)}; this engine supports major ${SCHEMA_MAJOR} only (D-DATA-002)`,
    );
  }

  const id = caseDoc['id'];
  if (typeof id !== 'string' || evidence['caseId'] !== id || reference['caseId'] !== id) {
    throw new CaseLoadError(
      'case-id-mismatch',
      `case, evidence and reference sections disagree on the case id (${String(id)})`,
    );
  }

  const t0 = evidence['T0'];
  if (typeof t0 !== 'string' || parseIsoToEpochMs(t0) === null) {
    throw new CaseLoadError(
      'bad-time',
      `evidence.T0 is not an absolute ISO-8601 instant: ${String(t0)}`,
    );
  }

  const from = chunk['compiledFrom'];
  return {
    compiledFrom: typeof from === 'string' ? from : null,
    caseLocalUtcOffsetMinutes: offset,
    case: caseDoc as unknown as CaseDocument,
    evidence: evidence as unknown as EvidenceDocument,
    reference: reference as unknown as ReferenceDocument,
    citations: citations as unknown as CitationsDocument,
    reviewRecord,
  };
}
