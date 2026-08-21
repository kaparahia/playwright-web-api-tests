import { defineConfig, devices } from '@playwright/test';

/**
 * Full configuration documentation: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  // Run tests in a file in parallel.
  fullyParallel: true,

  // Forbid test.only in CI to prevent accidentally committing focused tests.
  forbidOnly: !!process.env.CI,

  // Number of retries for flaky tests.
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers.
  workers: process.env.CI ? 2 : undefined,

  // Test results reporter.
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  use: {
    // Base URL, so tests can simply call page.goto('/').
    baseURL: 'https://www.saucedemo.com',

    // Collect a trace only when a test fails after a retry, which is useful for debugging.
    trace: 'on-first-retry',

    // Take screenshots only when a test fails.
    screenshot: 'only-on-failure',

    // Retain video only when a test fails.
    video: 'retain-on-failure',

    // Action timeout (click, fill, and so on).
    actionTimeout: 10_000,
  },

  // Overall timeout for one test.
  timeout: 30_000,

  projects: [
    // API tests do not need a browser, so they run in a separate project with
    // its own testDir. Otherwise, they would run once for every browser profile
    // below, which would be both slow and pointless for API tests.
    {
      name: 'api',
      testDir: './tests/api',
    },

    // Test with three browser engines; the list is easy to extend.
    // testIgnore excludes tests/api from these projects, while combined UI+API
    // tests in tests/combined remain because they need a browser.
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/api/**',
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: '**/api/**',
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: '**/api/**',
    },
    // Example mobile profile; add more as needed.
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testIgnore: '**/api/**',
    },
  ],
});
