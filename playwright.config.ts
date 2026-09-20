import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './checks',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.PRODUCTION_BASE_URL || 'https://www.danideclares.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
