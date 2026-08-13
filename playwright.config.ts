import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL;

if (!baseURL) {
  throw new Error('PLAYWRIGHT_BASE_URL must be supplied by scripts/run-browser-qa.js.');
}

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 8_000,
  },
  globalTimeout: 8 * 60_000,
  forbidOnly: true,
  retries: 0,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'test-results',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: process.env.PLAYWRIGHT_HEADED !== '1',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
    actionTimeout: 8_000,
    navigationTimeout: 15_000,
  },
});
