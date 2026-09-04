// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitest/config';

// Workspace test runner: one Vitest project per package that has tests.
export default defineConfig({
  test: {
    projects: ['packages/engine', 'packages/app'],
  },
});
