// SPDX-License-Identifier: MIT
// ESLint flat config for the medrecsim workspace (EP-8).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './packages/app/svelte.config.js';

/**
 * Import restrictions shared by both engine blocks. ESLint flat config replaces (never merges)
 * a rule's options when a later block configures the same rule for the same file, so the
 * seam-boundary block below re-states these and adds its own.
 */
const ENGINE_VALUE_IMPORT_PATHS = [
  'yaml',
  'svelte',
  'vite',
  'fast-check',
  '@medrecsim/content-tools',
  {
    name: 'zod',
    message:
      'zod is not on the runtime allowlist (DEPENDENCY-POLICY.md §3; owner-only, D-EXEC-003). Import types or @medrecsim/schema/vocab constants only.',
  },
  {
    name: '@medrecsim/schema/evidence',
    message: 'Evidence schemas are zod values; import the types only.',
    allowTypeImports: true,
  },
  {
    name: '@medrecsim/schema/reference',
    message: 'Reference schemas are zod values; import the types only.',
    allowTypeImports: true,
  },
  {
    name: '@medrecsim/schema/documents',
    message: 'Document schemas are zod values; import the types only.',
    allowTypeImports: true,
  },
];
const ENGINE_IMPORT_PATTERNS = [
  {
    group: ['svelte/*', 'node:*', '@medrecsim/content-tools/*'],
    message: 'Engine code is headless and platform-free.',
  },
];

/**
 * Engine determinism fence (D-ARCH-006, architecture §2; placeholder at EP-8, made real at
 * EP-11). The reducer must be a pure function of (state, action): no wall clock, no
 * randomness, no async, no locale, no platform globals, no DOM, no I/O. Tests and the test
 * support helpers are exempt (fast-check owns its own PRNG, ADR-6; fixtures are compiled
 * through the content CLI).
 */
const engineDeterminism = {
  name: 'medrecsim/engine-determinism',
  files: ['packages/engine/src/**/*.ts'],
  ignores: ['packages/engine/src/**/*.test.ts', 'packages/engine/src/test-support/**'],
  languageOptions: { globals: {} },
  rules: {
    'no-restricted-globals': [
      'error',
      // Clock
      {
        name: 'Date',
        message: 'Engine code is clock-free; simulated time is state (core/time.ts).',
      },
      { name: 'performance', message: 'Engine code is clock-free.' },
      // Randomness
      { name: 'crypto', message: 'No randomness in the engine.' },
      // Async / scheduling
      { name: 'Promise', message: 'Engine code is synchronous.' },
      { name: 'setTimeout', message: 'Engine code is synchronous.' },
      { name: 'setInterval', message: 'Engine code is synchronous.' },
      { name: 'setImmediate', message: 'Engine code is synchronous.' },
      { name: 'queueMicrotask', message: 'Engine code is synchronous.' },
      { name: 'requestAnimationFrame', message: 'Engine code is synchronous and has no DOM.' },
      { name: 'requestIdleCallback', message: 'Engine code is synchronous and has no DOM.' },
      // Locale
      { name: 'Intl', message: 'Engine code is locale-free (deterministic across machines).' },
      // Network
      { name: 'fetch', message: 'Engine code never touches the network (boundary B7).' },
      { name: 'XMLHttpRequest', message: 'Engine code never touches the network (boundary B7).' },
      { name: 'WebSocket', message: 'Engine code never touches the network (boundary B7).' },
      // DOM / browser / platform
      { name: 'window', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'document', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'navigator', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'self', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'location', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'history', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      { name: 'Worker', message: 'Engine code has zero DOM dependencies (D-ARCH-006).' },
      {
        name: 'localStorage',
        message: 'Persistence goes through a StorageLike the app passes in (ADR-5).',
      },
      {
        name: 'sessionStorage',
        message: 'Persistence goes through a StorageLike the app passes in (ADR-5).',
      },
      {
        name: 'indexedDB',
        message: 'Persistence goes through a StorageLike the app passes in (ADR-5).',
      },
      { name: 'globalThis', message: 'Engine code reads no ambient globals.' },
      { name: 'process', message: 'Engine code reads no ambient globals (no Node).' },
      { name: 'console', message: 'Engine code has no side effects; return a Result instead.' },
    ],
    'no-restricted-properties': [
      'error',
      { object: 'Math', property: 'random', message: 'No randomness in the engine.' },
      { object: 'Date', property: 'now', message: 'Engine code is clock-free.' },
    ],
    'no-restricted-syntax': [
      'error',
      { selector: 'AwaitExpression', message: 'Engine code is synchronous.' },
      { selector: 'ForOfStatement[await=true]', message: 'Engine code is synchronous.' },
      { selector: 'FunctionDeclaration[async=true]', message: 'Engine code is synchronous.' },
      { selector: 'FunctionExpression[async=true]', message: 'Engine code is synchronous.' },
      { selector: 'ArrowFunctionExpression[async=true]', message: 'Engine code is synchronous.' },
      { selector: "NewExpression[callee.name='Date']", message: 'Engine code is clock-free.' },
      { selector: "NewExpression[callee.name='Promise']", message: 'Engine code is synchronous.' },
      { selector: 'MetaProperty', message: 'Engine code reads no import.meta (no environment).' },
      {
        selector: 'CallExpression[callee.property.name=/^toLocale/]',
        message: 'Locale-dependent formatting is not deterministic; format in the app.',
      },
      {
        selector: "CallExpression[callee.property.name='localeCompare']",
        message: 'localeCompare depends on the machine locale; compare code points.',
      },
      {
        selector: "CallExpression[callee.property.name='sort'][arguments.length=0]",
        message:
          'sort() without a comparator orders by string coercion; pass an explicit, total comparator.',
      },
    ],
    // Value imports: only the layer-neutral vocab and version modules of the schema package
    // (both zod-free). Types may come from any schema entry point (erased at compile time).
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          ...ENGINE_VALUE_IMPORT_PATHS,
          {
            name: '@medrecsim/schema',
            message:
              'The schema root barrel carries zod; import types only, or values from @medrecsim/schema/vocab and @medrecsim/schema/version.',
            allowTypeImports: true,
          },
        ],
        patterns: ENGINE_IMPORT_PATTERNS,
      },
    ],
  },
};

/**
 * Engine seam boundary (D-MED-005; EP-11). The engine's core — state, reducer, clock,
 * dialogue, escalation, workspace, projection, persistence — may name evidence-layer types
 * only. The hard guarantee is packages/engine/tsconfig.evidence.json (proven by
 * scripts/check-layer-separation.mjs); this rule gives the same message in the editor.
 */
const engineLayerBoundary = {
  name: 'medrecsim/engine-layer-boundary',
  files: ['packages/engine/src/core/**/*.ts'],
  ignores: ['packages/engine/src/**/*.test.ts'],
  rules: {
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        paths: [
          ...ENGINE_VALUE_IMPORT_PATHS.filter(
            (p) =>
              typeof p === 'string' ||
              (p.name !== '@medrecsim/schema/reference' &&
                p.name !== '@medrecsim/schema/documents'),
          ),
          {
            name: '@medrecsim/schema',
            message:
              'The engine core cannot reach the reference layer; use @medrecsim/schema/evidence, /vocab or /version (D-MED-005, INV-TRUTH-001).',
          },
          {
            name: '@medrecsim/schema/reference',
            message: 'Pre-signature engine code cannot name reference-layer types (D-MED-005).',
          },
          {
            name: '@medrecsim/schema/documents',
            message: 'Pre-signature engine code cannot name bundle-document types (D-MED-005).',
          },
        ],
        patterns: [
          ...ENGINE_IMPORT_PATTERNS,
          {
            group: [
              '**/reference/**',
              '**/documents/**',
              '../case-loader*',
              '../session*',
              '../index*',
            ],
            message:
              'The engine core cannot reach the reference layer or the seam (D-MED-005, INV-TRUTH-001).',
          },
        ],
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
      // Compile-error fixtures for the layer boundary: deliberately violate it (EP-9 item 3,
      // EP-11 engine seam).
      'packages/schema/layer-fixtures/**',
      'packages/engine/layer-fixtures/**',
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
  engineLayerBoundary,
  schemaLayerBoundary,
  prettier,
);
