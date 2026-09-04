// SPDX-License-Identifier: MIT
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // Svelte 5 needs its browser build under jsdom.
  resolve: { conditions: ['browser'] },
  test: {
    name: 'app',
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
