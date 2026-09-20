import { defineConfig } from 'checkly';

export default defineConfig({
  logicalId: 'dani-declares-production',
  projectName: 'DANI DECLARES Production',
  checks: {
    playwrightConfigPath: './playwright.config.ts',
    playwrightChecks: [
      {
        name: 'Critical Production Journeys',
        logicalId: 'critical-production-journeys',
        pwTags: 'critical',
        frequency: 10,
        locations: ['us-east-1'],
      },
    ],
  },
});
