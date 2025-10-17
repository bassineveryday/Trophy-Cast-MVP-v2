module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
    es6: true,
    node: true,
    jest: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // React rules
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
  'react-hooks/exhaustive-deps': 'off',
    
    // TypeScript rules
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-var-requires': 'off',
    
  // React Native specific (temporarily relaxed during rebrand sweep; re-enable incrementally)
  'react-native/no-unused-styles': 'off',
  'react-native/split-platform-components': 'off',
  'react-native/no-inline-styles': 'off',
  'react-native/no-color-literals': 'warn',
  'react-native/sort-styles': 'off',
    'react-native/no-raw-text': 'off', // Too restrictive for our use case
    
    // General code quality
  'no-console': 'off', // Needed for debugging in React Native
  'react/no-unescaped-entities': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'coverage/',
    'babel.config.js',
    'metro.config.js',
    'jest.config.js',
    'scripts/**',
    'types/**',
  ],
};