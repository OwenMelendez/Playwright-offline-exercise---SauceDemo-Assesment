import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './src/support/auth';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // Explicit on purpose: the brief asks for screenshots in test-results/.
  outputDir: './test-results',

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  // SauceDemo is a public shared site: keep CI polite. Locally use Playwright's default.
  workers: isCI ? 2 : undefined,

  // Justification for non-default values lives in README.md ("Timeouts").
  timeout: 30_000,
  expect: { timeout: 7_000 },

  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    // BASE_URL override exists only so the suite can be pointed at a mirror; default is the real site.
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },

  projects: [
    // Logs in once through the UI and writes the session to AUTH_FILE.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],
});
