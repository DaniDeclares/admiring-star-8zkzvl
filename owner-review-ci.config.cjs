// Dedicated, repository-portable owner-review regression configuration.
// No customer credentials or production services are used by these tests.
module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>/api-handlers', '<rootDir>/src'],
  testEnvironment: 'jsdom',
  testMatch: ['**/_ownerReviewCore.test.js', '**/owner-review-artifacts.test.js', '**/OwnerReviewArtifactPage.test.jsx'],
  transform: { '^.+\\.[jt]sx?$': ['babel-jest', { presets: ['babel-preset-react-app'] }] },
  setupFiles: ['<rootDir>/scripts/ownerReviewNetworkDeny.cjs', '<rootDir>/scripts/ownerReviewTextDecoder.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  cache: false,
  maxWorkers: 1
};
