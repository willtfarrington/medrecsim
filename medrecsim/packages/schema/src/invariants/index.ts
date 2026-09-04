// SPDX-License-Identifier: MIT
export * from './types.ts';
export * from './attribution.ts';
export * from './harm-language.ts';
export * from './case-invariants.ts';
export * from './spdx.ts';
export * from './validate.ts';

/** Invariant ids shipped at EP-9 (core subset + W4 cross-hooks + package-local shape rule). */
export const SHIPPED_INVARIANTS = [
  'INV-TIME-001',
  'INV-REF-001',
  'INV-TRUTH-001',
  'INV-DISC-001',
  'INV-ACT-001',
  'INV-META-001',
  'INV-VERS-001',
  'INV-CIT-001',
  'INV-SPDX-001',
  'INV-REG-001',
  'INV-SCOPE-001',
  'INV-SHAPE-001',
] as const;

/** Catalogue entries deferred to EP-20 (architecture §4). */
export const DEFERRED_INVARIANTS = [
  'INV-TIME-002',
  'INV-TIME-003',
  'INV-REF-002',
  'INV-DISC-002',
  'INV-DISC-003',
  'INV-ACT-002',
  'INV-HINT-001',
  'INV-A11Y-001',
] as const;
