module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  globals: {
    NodeJS: 'readonly'
  },
  extends: [
    'eslint:recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: [
    'vue'
  ],
  rules: {
    // Vue関連のルール調整
    'vue/multi-word-component-names': 'off',
    
    // 未使用変数のルール調整
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['**/*.vue'],
      extends: ['plugin:vue/vue3-essential']
    },
    {
      files: ['**/*.test.ts', '**/*.test.js'],
      env: {
        jest: false
      },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        test: 'readonly',
        vi: 'readonly',
        vitest: 'readonly'
      }
    }
  ]
} 