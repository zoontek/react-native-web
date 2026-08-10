import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['promise', 'react'],
  ignorePatterns: ['packages/**/vendor/*', 'types'],
  env: {
    browser: true,
    jest: true,
    node: true
  },
  options: {
    typeAware: true
  },
  categories: {
    correctness: 'error',
    perf: 'error',
    suspicious: 'error'
  },
  rules: {
    'default-case': ['error', { commentPattern: '^no default$' }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'new-cap': ['error', { newIsCap: true, capIsNew: false }],
    'no-alert': 'warn',
    'no-array-constructor': 'error',
    'no-case-declarations': 'error',
    'no-fallthrough': 'error',
    'no-inner-declarations': ['error', 'functions'],
    'no-label-var': 'error',
    'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
    'no-lone-blocks': 'error',
    'no-loop-func': 'error',
    'no-multi-str': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-object-constructor': 'error',
    'no-proto': 'error',
    'no-redeclare': 'error',
    'no-regex-spaces': 'error',
    'no-return-assign': ['error', 'except-parens'],
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off',
    'no-throw-literal': 'error',
    'no-undef': 'error',
    'no-underscore-dangle': 'off',
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],
    'no-unused-vars': ['error', { vars: 'all', args: 'none' }],
    'no-useless-computed-key': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    radix: 'error',
    yoda: ['error', 'never'],

    // node
    'node/handle-callback-err': ['error', '^(err|error)$'],
    'node/no-path-concat': 'error',

    // promise
    'promise/always-return': 'off',
    'promise/param-names': 'error',

    // react
    'react/iframe-missing-sandbox': 'off',
    'react/jsx-pascal-case': 'error',
    'react/no-children-prop': 'off',
    'react/no-this-in-sfc': 'off',
    'react/no-unknown-property': 'error',
    'react/prefer-es6-class': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/self-closing-comp': 'error',

    // react-hooks
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'warn',

    // temporarily disabled
    'no-unused-expressions': 'off'

    // 'no-unused-vars': [
    //   'error',
    //   { argsIgnorePattern: '^_', ignoreRestSiblings: true }
    // ]
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      plugins: ['typescript'],
      rules: {
        'typescript/explicit-function-return-type': 'error',
        'typescript/explicit-module-boundary-types': 'error',
        'typescript/no-empty-object-type': 'error',
        'typescript/no-import-type-side-effects': 'error',
        'typescript/no-invalid-void-type': 'error',
        'typescript/no-non-null-assertion': 'error',

        // temporarily disabled
        'typescript/no-dynamic-delete': 'off',
        'typescript/no-explicit-any': 'off',
        'typescript/no-extraneous-class': 'off',
        'typescript/no-unsafe-type-assertion': 'off',
        'typescript/no-wrapper-object-types': 'off'

        // 'typescript/strict-boolean-expressions': [
        //   'error',
        //   {
        //     allowNullableObject: false,
        //     allowNumber: false,
        //     allowString: false
        //   }
        // ],
      }
    }
  ]
});
