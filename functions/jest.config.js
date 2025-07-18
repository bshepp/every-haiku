module.exports = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.js",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!jest.config.js",
    "!.eslintrc.js",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    "**/__tests__/**/*.test.js",
    "**/?(*.)+(spec|test).js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,
};