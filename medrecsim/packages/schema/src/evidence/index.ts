// SPDX-License-Identifier: MIT
/**
 * Evidence layer barrel. Nothing here may import from ../reference (INV-TRUTH-001; enforced by
 * tsconfig.evidence.json and the ESLint boundary rule).
 */
export * from './patient.ts';
export * from './sources.ts';
export * from './claims.ts';
export * from './allergy-claims.ts';
export * from './dialogue.ts';
export * from './artifacts.ts';
export * from './escalation-channels.ts';
export * from './document.ts';
