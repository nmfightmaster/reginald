// eslint.config.mjs
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  { ignores: ['**/dist/**', '**/build/**', '**/.vite/**', '**/node_modules/**', '**/target/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended, // non-type-aware: fast, low-noise starter
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        // Not using type-aware rules yet to keep perf snappy in W1
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { react: reactPlugin, 'react-hooks': reactHooks },
    rules: {
      'react/react-in-jsx-scope': 'off', // not needed with React 17+
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
