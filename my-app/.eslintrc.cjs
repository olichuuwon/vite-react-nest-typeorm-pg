/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // turn off rules that conflict with Prettier
  ],
  ignorePatterns: ['dist', 'server/dist', 'node_modules'],
  overrides: [
    {
      // Frontend (Vite React)
      files: ['src/**/*.{ts,tsx,js,jsx}'],
      env: {
        browser: true,
        node: false,
      },
    },
    {
      // Backend (Nest)
      files: ['server/src/**/*.{ts,js}'],
      env: {
        node: true,
        browser: false,
      },
    },
  ],
  rules: {
    // React 17+ / Vite: no need to import React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',

    // Imports nice-to-haves
    'import/order': 'off', // you can enforce later if you want
  },
}
