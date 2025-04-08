import globals from 'globals';
import js from '@eslint/js';

export default [
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.js'],
    ignores: ['node_modules/', 'dist/', '.fwd/', 'sessions/'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      semi: ['error', 'always'],
      'no-unused-vars': 'warn',
      'no-undef': 'error',
    },
  },
];
