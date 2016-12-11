module.exports = {
  extends: [
    'eslint-config-airbnb-base',
    'eslint-config-airbnb-base/rules/strict'
  ].map(require.resolve),
  rules: {
    'arrow-body-style': [ 'off', 'as-needed' ],
    'array-bracket-spacing': [ 'error', 'always', { 'objectsInArrays': false, 'arraysInArrays': false } ],
    'arrow-parens': [ 'error', 'always' ],
    'class-methods-use-this': [ 'error', { 'exceptMethods': [ 'render' ] } ],
    'comma-dangle': [ 'error', 'never' ],
    'dot-notation': [ 'error', { 'allowKeywords': true, 'allowPattern': '^[A-Z]+[A-Za-z]+$' } ],
    'global-require': 'warn',
    'no-constant-condition': [ 'error', { 'checkLoops': false } ],
    'no-mixed-operators': [ 'error', { 'allowSamePrecedence': true } ],
    'no-underscore-dangle': [ 'error', { 'allowAfterThis': true } ],
    'no-unused-vars': [ 'warn', { 'vars': 'local', 'args': 'after-used' } ],
    'prefer-const': 'off',
    'prefer-template': 'warn',
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'never' ],
    'vars-on-top': 'off',

    'import/no-extraneous-dependencies': [ 'off' ],
    'import/no-mutable-exports': 'off'
  }
}
