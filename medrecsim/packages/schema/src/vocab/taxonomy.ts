// SPDX-License-Identifier: MIT
/**
 * Five-axis discrepancy taxonomy v1.0 (D-TAX-001) — imported VERBATIM from
 * docs/clinical/TAXONOMY.md §8, spelling-frozen by the owner's approval recorded in §11
 * (EP-7 handoff, 2026-09-02). Do not edit tokens here: a token change is a clinical-semantics
 * change (owner-only, D-EXEC-003) and a codemod migration (D-DATA-002).
 *
 * Labels for display live in the app layer; this module carries tokens only.
 */

/** Axis 1 — Type (13 values). */
export const DISCREPANCY_TYPES = [
  'omission',
  'commission',
  'wrong-dose',
  'wrong-frequency-schedule',
  'wrong-route',
  'wrong-formulation',
  'wrong-strength-concentration',
  'therapeutic-duplication',
  'brand-generic-duplication',
  'wrong-drug-lasa',
  'restart-gap',
  'status-discrepancy',
  'allergy-record-discrepancy',
] as const;
export type DiscrepancyType = (typeof DISCREPANCY_TYPES)[number];

/**
 * Axis 2 — Causal mechanism (14 values in four strata). The strata are documentation
 * groupings (TAXONOMY.md §8 note); the schema flattens them to one enum of fourteen tokens
 * and keeps the map for tooling (coverage predicates at EP-20 read the stratum).
 */
export const MECHANISM_STRATA = {
  'system-record': [
    'stale-record-propagation',
    'transcription-error',
    'lasa-confusion',
    'transition-communication-gap',
    'data-fragmentation',
    'auto-population-default-error',
  ],
  'undocumented-intentional': ['prescriber-change-undocumented', 'hold-not-documented'],
  'patient-agent-side': [
    'cost-access-barrier',
    'supply-interruption',
    'regimen-complexity-misunderstanding',
    'informed-self-adjustment',
    'language-access-barrier',
  ],
  epistemic: ['informant-knowledge-limit'],
} as const;
export type MechanismStratum = keyof typeof MECHANISM_STRATA;

export const MECHANISMS = [
  ...MECHANISM_STRATA['system-record'],
  ...MECHANISM_STRATA['undocumented-intentional'],
  ...MECHANISM_STRATA['patient-agent-side'],
  ...MECHANISM_STRATA.epistemic,
] as const;
export type Mechanism = (typeof MECHANISMS)[number];

export function mechanismStratum(mechanism: Mechanism): MechanismStratum {
  for (const [stratum, tokens] of Object.entries(MECHANISM_STRATA)) {
    if ((tokens as readonly string[]).includes(mechanism)) return stratum as MechanismStratum;
  }
  throw new Error(`unknown mechanism token: ${mechanism}`);
}

/** Axis 3 — Detectability (7 values). */
export const DETECTABILITIES = [
  'single-source-explicit',
  'cross-source-conflict',
  'interview-elicited',
  'artifact-dependent',
  'escalation-dependent',
  'longitudinal-inference',
  'irreducible',
] as const;
export type Detectability = (typeof DETECTABILITIES)[number];

/** Axis 4 — Urgency (ordinal; U4 = immediate / time-critical). */
export const URGENCIES = ['U1', 'U2', 'U3', 'U4'] as const;
export type Urgency = (typeof URGENCIES)[number];

/** Axis 5a — Severity (ordinal; NCC MERP read as potential worst-credible outcome). */
export const SEVERITIES = ['S0', 'S1', 'S2', 'S3', 'S4'] as const;
export type Severity = (typeof SEVERITIES)[number];

/** Axis 5b — Reversibility (ordinal). */
export const REVERSIBILITIES = [
  'self-limiting',
  'reversible-with-treatment',
  'irreversible',
] as const;
export type Reversibility = (typeof REVERSIBILITIES)[number];

/** Axis 5c — Time to harm (ordinal). */
export const TIMES_TO_HARM = ['immediate', 'hours-to-a-day', 'days', 'weeks-plus'] as const;
export type TimeToHarm = (typeof TIMES_TO_HARM)[number];

/**
 * D-TAX-002 must-cover phenotype predicates P1–P10 (TAXONOMY.md §6). Declared per case in
 * case.yaml `coverage.phenotypes`; EP-20's coverage tool evaluates the predicates mechanically
 * and must agree with the declaration.
 */
export const PHENOTYPES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'] as const;
export type Phenotype = (typeof PHENOTYPES)[number];
