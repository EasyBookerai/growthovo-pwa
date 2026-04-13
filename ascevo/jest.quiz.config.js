/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native-url-polyfill|@supabase|@react-native-async-storage)/)',
  ],
  testMatch: ['**/__tests__/onboardingQuizService.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^react-native-url-polyfill/auto$': '<rootDir>/src/__mocks__/empty.ts',
    '^react-native-url-polyfill$': '<rootDir>/src/__mocks__/empty.ts',
    '^./supabaseClient$': '<rootDir>/src/__mocks__/supabaseClient.ts',
    '^../services/supabaseClient$': '<rootDir>/src/__mocks__/supabaseClient.ts',
    '^../../services/supabaseClient$': '<rootDir>/src/__mocks__/supabaseClient.ts',
  },
};
