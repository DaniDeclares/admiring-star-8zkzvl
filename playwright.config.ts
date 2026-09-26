import { defineConfig } from '@playwright/test';

const TEMPORARY_PRODUCTION_BASE_URL =
  'https://sparkling-croissant-829102.netlify.app';

export default defineConfig({
  testDir: './checks',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    // Vercel is intentionally deferred for the current continuity window.
    // Until the hosting authority is explicitly changed, production proof
    // must target the active Netlify rail rather than danideclares.com.
    baseURL: process.env.PRODUCTION_BASE_URL || TEMPORARY_PRODUCTION_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
