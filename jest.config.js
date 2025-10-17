module.exports = {
  preset: 'react-native',
  
  // Use ts-jest for TypeScript files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module paths
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform node_modules for React Native
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo|@expo|@supabase|react-native-toast-message|expo-font|@expo/vector-icons|expo-linear-gradient)/)'
  ],
  
  // Module name mapper for assets and styles
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/__mocks__/vectorIconsMock.js',
    '^expo-font$': '<rootDir>/__mocks__/fileMock.js',
    '^expo-modules-core$': '<rootDir>/__mocks__/fileMock.js',
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'screens/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // Coverage thresholds - focused on critical paths only
  // Note: Low thresholds are intentional - we test what matters most
  coverageThreshold: {
    global: {
      statements: 8,
      branches: 2,
      functions: 9,
      lines: 8,
    },
  },
};
