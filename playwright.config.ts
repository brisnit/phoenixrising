import { defineConfig, devices } from '@playwright/test'

/**
 * Browser-level regression suite.
 *
 * This exists because Round 1 shipped six real defects past a green
 * typecheck, lint and production build — masked headings that never revealed,
 * a button whose label rendered white-on-white, pinned sections taller than
 * the viewport, and colliding SVG ids. None of those are detectable without
 * rendering the page and measuring it.
 *
 * Tests run against a production build rather than the dev server, because
 * the failure modes above involve font loading, chunk splitting and
 * hydration — all of which behave differently in development.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.PW_BASE_URL ?? 'http://127.0.0.1:4318',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  /* The Round 1 breakpoints plus 1280. Desktop carries the richest
     choreography; 1280 is where the horizontal navigation first appears and
     is therefore the tightest test of header spacing; 1024 is where pinned
     sections are most likely to overflow; 768 and 375 are where layouts are
     rebuilt rather than merely scaled. */
  projects: [
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'desktop-1280', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    /* A short desktop viewport — a laptop once browser chrome is subtracted.
       Height matters for the pinned sections, whose scroll ranges and
       min-h-screen bands are both expressed in viewport units. */
    { name: 'laptop-short-1512x790', use: { ...devices['Desktop Chrome'], viewport: { width: 1512, height: 790 } } },
    { name: 'laptop-1024', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } } },
    { name: 'tablet-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
  ],

  webServer: {
    command: 'npm run build && npm run start -- --port 4318',
    url: 'http://127.0.0.1:4318',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
