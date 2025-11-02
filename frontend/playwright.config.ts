import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL?.trim() || 'http://127.0.0.1:4173';
const isCI = !!process.env.CI;
const headed = !!process.env.PLAYWRIGHT_HEADED;

export default defineConfig({
  timeout: 60_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      timeout: 15_000,
    },
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-report/junit/results.xml' }],
  ],
  use: {
    baseURL,
    headless: headed ? false : true,
    trace: isCI ? 'retain-on-failure' : 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    viewport: { width: 1440, height: 900 },
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL,
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL,
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
        baseURL,
      },
    },
  ],
  webServer: {
    command: 'pnpm build && pnpm preview',
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 30_000,
  },
  testDir: 'e2e',
});
