import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // no-empty-interface was replaced by no-empty-object-type.
      // allowInterfaces: 'with-single-extends' is allowSingleExtends: true.
      '@typescript-eslint/no-empty-object-type': [
        'error',
        { allowInterfaces: 'with-single-extends' },
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      'no-console': 'warn',
      // type-annotation-spacing was removed in typescript-eslint v8.
      // Prettier owns that spacing now.
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/prefer-readonly': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/adjacent-overload-signatures': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  // Last rule config: turns off stylistic rules that conflict with Prettier
  // and reports prettier/prettier as an error.
  prettierRecommended,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated test output. The old .eslintignore did not list coverage.
    'coverage/**',
    // Carried over from .eslintignore. node_modules is ignored by default.
    'jest.config.js',
  ]),
])

export default eslintConfig
