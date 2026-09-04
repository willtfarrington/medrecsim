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
      { paths: ['yaml', 'svelte', 'vite'], patterns: ['svelte/*', 'node:*'] },
    ],
  },
};

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.svelte-kit/**', '**/coverage/**'],
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
      // ADR-3: the runtime never parses YAML.
      'no-restricted-imports': ['error', { paths: ['yaml'] }],
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
  prettier,
);
