// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'content-tools',
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // The CLI tests spawn `node` on the real content tree and the fixture suite.
    testTimeout: 60_000,
  },
});
