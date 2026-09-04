// SPDX-License-Identifier: MIT
// ESLint flat config for the medrecsim workspace (EP-8).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './packages/app/svelte.config.js';

/**
 * Engine determinism rule (placeholder, hardened at EP-11; D-ARCH-006, architecture §2).
 * The reducer must be a pure function of (state, action): no wall clock, no randomness, no
 * async, no DOM. Test files are exempt (fast-check owns its own PRNG, ADR-6).
 */
const engineDeterminism = {
  name: 'medrecsim/engine-determinism',
  files: ['packages/engine/src/**/*.ts'],
  ignores: ['packages/engine/src/**/*.test.ts'],
  languageOptions: { globals: {} },
  rules: {
    'no-restricted-globals': [
      'error',
      { name: 'Date', message: 'Engine code is clock-free; simulated time is state.' },
      { name: 'performance', message: 'Engine code is clock-free.' },
      { name: 'setTimeout', message: 'Engine code is synchronous.' },
      { name: 'setInterval', message: 'Engine code is synchronous.' },
      { name: 'queueMicrotask', message: 'Engine code is synchronous.' },
      { name: 'fetch', message: 'Engine code never touches the network (boundary B7).' },
      { name: 'window', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'document', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'localStorage', message: 'Persistence is the app adapter’s job (ADR-5).' },
      { name: 'crypto', message: 'No randomness in the engine.' },
    ],
    'no-restricted-properties': [
      'error',
      { object: 'Math', property: 'random', message: 'No randomness in the engine.' },
      { object: 'Date', property: 'now', message: 'Engine code is clock-free.' },
    ],
    'no-restricted-syntax': [
      'error',
      { selector: 'AwaitExpression', message: 'Engine code is synchronous.' },
      { selector: 'FunctionDeclaration[async=true]', message: 'Engine code is synchronous.' },
      { selector: 'FunctionExpression[async=true]', message: 'Engine code is synchronous.' },
      { selector: 'ArrowFunctionExpression[async=true]', message: 'Engine code is synchronous.' },
      { selector: "NewExpression[callee.name='Date']", message: 'Engine code is clock-free.' },
      { selector: "NewExpression[callee.name='Promise']", message: 'Engine code is synchronous.' },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          'yaml',
          'svelte',
          'vite',
          {
            name: 'zod',
            message:
              'zod is not on the runtime allowlist (DEPENDENCY-POLICY.md §3; owner-only, D-EXEC-003). Import types or @medrecsim/schema/vocab constants only.',
          },
        ],
        patterns: ['svelte/*', 'node:*'],
      },
    ],
  },
};

/**
 * Two-layer truth/action contract (D-MED-005, INV-TRUTH-001; EP-9). The learner-observable
 * evidence layer and the layer-neutral modules may never import the author-only reference
 * layer. The hard guarantee is TypeScript's project boundary (packages/schema/tsconfig.evidence.json,
 * proven by scripts/check-layer-separation.mjs); this rule gives the same message in the editor.
 */
const schemaLayerBoundary = {
  name: 'medrecsim/schema-layer-boundary',
  files: [
    'packages/schema/src/evidence/**/*.ts',
    'packages/schema/src/common/**/*.ts',
    'packages/schema/src/vocab/**/*.ts',
  ],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/reference/**', '**/documents/**', '**/invariants/**'],
            message:
              'Evidence-layer and layer-neutral modules cannot reach the reference layer (D-MED-005, INV-TRUTH-001).',
          },
        ],
      },
    ],
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.svelte-kit/**',
      '**/coverage/**',
      // Compile-error fixture for the layer boundary: deliberately violates it (EP-9 item 3).
      'packages/schema/layer-fixtures/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
  },
  {
    files: ['packages/app/**/*.{ts,svelte}'],
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // ADR-3: the runtime never parses YAML. zod is not on the runtime allowlist (policy §3).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            'yaml',
            {
              name: 'zod',
              message:
                'zod is not on the runtime allowlist (DEPENDENCY-POLICY.md §3; owner-only, D-EXEC-003). Use compiled JSON and @medrecsim/schema types/vocab only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'packages/content-tools/**/*.ts', '**/*.config.{js,ts,mjs}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ['**/*.test.ts'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  engineDeterminism,
  schemaLayerBoundary,
  prettier,
);
