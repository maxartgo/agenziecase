export default {
  // Environment to use
  testEnvironment: 'node',

  // Root directory for tests
  roots: ['<rootDir>/__tests__'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Coverage configuration
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!__tests__/**',
    '!coverage/**',
    '!jest.config.js',
    '!index.js',
    '!debug-server.js',
    '!migrations/**',
    '!uploads/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './models/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './controllers/': {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Coverage output
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // Transform files (if needed)
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ],

  // Verbose output
  verbose: true,

  // Module name mapper for absolute imports (if needed)
  moduleNameMapper: {
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@controllers/(.*)$': '<rootDir>/controllers/$1',
    '^@routes/(.*)$': '<rootDir>/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/middleware/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1'
  },

  // Global setup/teardown
  globalSetup: '<rootDir>/__tests__/global-setup.js',
  globalTeardown: '<rootDir>/__tests__/global-teardown.js',

  // Max workers (default: number of CPU cores)
  maxWorkers: '50%',

  // Timeout per test
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
