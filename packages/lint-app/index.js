module.exports = {
  extends: [
    '@bruitt/lint-lib'
  ].map(require.resolve),
  rules: {
    'jsx-a11y/no-static-element-interactions': 'warn',

    'react/jsx-filename-extension': [ 'warn', { 'extensions': [ '.js' ] } ],
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off',
    'react/no-multi-comp': 'off'
  },
  globals: {
    'R': false
  }
}
