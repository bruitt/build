module.exports = {
  extends: [
    'airbnb',
    '@bruitt/eslint-config-lint-base'
  ].map(require.resolve),
  rules: {
    'jsx-a11y/no-static-element-interactions': 'warn',

    'react/jsx-filename-extension': [ 'warn', { 'extensions': [ '.jsx' ] } ],
    'react/prefer-stateless-function': 'off',
    'react/prop-types': 'off',
    'react/no-multi-comp': 'off',
    'react/sort-comp': [
      'error',
      {
        'order': [
          'static-methods',
          'lifecycle',
          '/^on.+$/',
          '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
          'everything-else',
          '/^render.+$/',
          'render'
        ]
      }
    ]
  },
  globals: {
    'R': false
  }
}
