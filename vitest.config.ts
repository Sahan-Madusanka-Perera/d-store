import { defineConfig } from 'vitest/config';
import path from 'node:path';

/**
 * Unit tests for the logic that decides money, access and abuse limits.
 *
 * Deliberately node-environment and no React: these suites cover pure functions, which
 * is where the bugs that cost money live. Component and end-to-end coverage would need
 * jsdom and Playwright respectively — see SECURITY.md for what is and is not covered.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts'],
      exclude: ['src/lib/**/*.test.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
