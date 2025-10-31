import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "coverage",
      include: ["**/*.ts"],
      exclude: ["**/tests/**", "**/node_modules/**", "playwright.config.ts"],
      thresholds: {
        statements: 95,
        branches: 90,
        lines: 95,
        functions: 95,
        perFile: true,
      },
    },
  },
});
