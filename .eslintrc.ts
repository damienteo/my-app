module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 2,
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
    '@typescript-eslint/no-inferrable-types': 2,
    '@typescript-eslint/no-misused-new': 2,
    '@typescript-eslint/no-misused-promises': 2,
    '@typescript-eslint/no-this-alias': 2,
    '@typescript-eslint/no-unnecessary-type-assertion': 2,
    '@typescript-eslint/prefer-includes': 2,
    'no-console': 1,
    '@typescript-eslint/type-annotation-spacing': 1,
    '@typescript-eslint/prefer-optional-chain': 1,
    '@typescript-eslint/prefer-readonly': 1,
    '@typescript-eslint/no-explicit-any': 1,
    '@typescript-eslint/adjacent-overload-signatures': 1,
    '@typescript-eslint/await-thenable': 1,
    '@typescript-eslint/consistent-type-assertions': 1,
    '@typescript-eslint/explicit-function-return-type': 0,
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': 0,
  },
}
