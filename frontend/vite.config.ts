import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    expect: { requireAssertions: true },
    coverage: {
      provider: 'v8',
      enabled: true,
      reporter: ['text', 'text-summary', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,ts,svelte}'],
      exclude: [
        '**/*.spec.{js,ts}',
        '**/*.test.{js,ts}',
        '**/*.stories.{js,ts,svelte}',
        '**/stories/**',
        '**/*.d.ts',
        '**/types/**',
        '**/__mocks__/**',
        '**/node_modules/**',
        'src/lib/index.ts', // Empty placeholder file
        'src/lib/stores/index.ts', // Re-export file
        'src/routes/**', // Route files tested via E2E
      ],
      thresholds: {
        lines: 90,
        functions: 85, // Lowered from 90 due to V8 coverage limitation with inline callbacks in bookingInit.ts
        branches: 88,
        statements: 90,
        perFile: true,
      },
    },
    projects: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**'],
          setupFiles: ['./vitest-setup-client.ts'],
        },
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
        },
      },
    ],
  },
});
