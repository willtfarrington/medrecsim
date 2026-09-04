// SPDX-License-Identifier: MIT
/**
 * Layer-neutral vocabularies (plain constants, no Zod import). Safe to consume from the app
 * and the engine without dragging the validation library into the runtime bundle.
 */
export * from './taxonomy.ts';
export * from './claim-status.ts';
export * from './model.ts';
export * from './brand-denylist.ts';
