// SPDX-License-Identifier: MIT
/**
 * @medrecsim/engine — the pure, headless simulation engine (D-ARCH-006; EP-11 engine core).
 *
 * Invariants this package always satisfies (architecture §2):
 * - zero DOM or Node dependencies (tsconfig `lib` is ES2023 only, `types` empty; the
 *   determinism lint rule forbids browser and platform globals);
 * - no wall clock, randomness, or async anywhere in the reducer — simulated time is state;
 * - state is a fold over the append-only action log (event sourcing); the log is persisted,
 *   never derived state;
 * - pre-signature views cannot name a reference-layer type (evidence-only TypeScript project
 *   `tsconfig.evidence.json`, proven by `scripts/check-layer-separation.mjs`);
 * - post-T0 actions never overwrite the reconstructed pre-admission state (D-MED-002).
 *
 * Scoring, signature validation and debrief data are EP-12; the seam for them lands here.
 */

export const ENGINE_PACKAGE = '@medrecsim/engine';

export { ENGINE_STATE_VERSION } from './core/state.ts';
export type {
  AskedRecord,
  EscalationOutcome,
  EscalationRecord,
  ExaminedRecord,
  FiredEvent,
  RevealRecord,
  RevealVia,
  ScheduledEvent,
  ScheduledEventKind,
  SessionState,
  SourceRecord,
  Workspace,
} from './core/state.ts';
export { ESCALATION_OUTCOMES, initialState } from './core/state.ts';

export type {
  AdmissionActionEntry,
  AdmissionActionInput,
  Confidence,
  DiscrepancyClassification,
  DiscrepancyEntry,
  DiscrepancyResolution,
  HistoryEntry,
  HistoryEntryInput,
  LearnerAction,
  LearnerActionType,
  MedKey,
} from './core/actions.ts';
export {
  ADMISSION_ACTION_TYPES,
  CONFIDENCE_LEVELS,
  LEARNER_ACTION_TYPES,
  RECONSTRUCTION_ACTION_TYPES,
  isLearnerAction,
  medKeyOf,
} from './core/actions.ts';

export type { EngineError, EngineErrorCode, Result } from './core/errors.ts';
export { ENGINE_ERROR_CODES } from './core/errors.ts';

export type { EvidenceIndex, IndexedNode, MedicationRef } from './core/evidence-index.ts';
export { EvidenceIndexError, buildEvidenceIndex } from './core/evidence-index.ts';

export type { ReduceContext } from './core/context.ts';
export type { ReplayResult, ReduceOptions } from './core/reduce.ts';
export { reduce, replay } from './core/reduce.ts';

export type { WindowStatus } from './core/clock.ts';
export { channelWindowAt, isoAt } from './core/clock.ts';

export type {
  AllergyClaimView,
  ArtifactView,
  ClaimView,
  ClockView,
  DialogueNodeView,
  DialogueTreeView,
  EscalationAttemptView,
  EscalationChannelView,
  LearnerMenus,
  RationaleOption,
  RevealView,
  SessionView,
  SourceStatus,
  SourceView,
  TimelineEntryView,
  WorkspaceView,
} from './core/view.ts';
export { projectView } from './core/view.ts';

export { stableStringify } from './core/serialize.ts';

export type {
  ClearResult,
  EnvelopeCheck,
  EnvelopeExpectation,
  EnvelopeMismatch,
  LoadResult,
  PersistenceAdapter,
  SaveResult,
  SessionEnvelope,
  StorageLike,
} from './core/persistence.ts';
export { DEFAULT_NAMESPACE, checkEnvelope, createPersistenceAdapter } from './core/persistence.ts';

export {
  DAY_MINUTES,
  WEEKDAY_TOKENS,
  formatEpochMsAsIso,
  localClockOf,
  parseIsoToEpochMs,
} from './core/time.ts';
export type { WeekdayToken } from './core/time.ts';

export type { CaseLoadErrorCode, CompiledCase } from './case-loader.ts';
export { CASE_LOAD_ERROR_CODES, CaseLoadError, loadCompiledCase } from './case-loader.ts';

export type {
  CreateSessionOptions,
  DebriefResult,
  RestoreResult,
  RestoreSessionOptions,
  Session,
  SignatureBlock,
  SignatureCheck,
} from './session.ts';
export { createSession, restoreSession } from './session.ts';
