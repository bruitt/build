module.exports = {
  extends: [
    "@bruitt/eslint-config-lint-base",
    "eslint-config-airbnb/rules/react",
    "eslint-config-airbnb/rules/react-a11y",
  ].map(require.resolve),
  rules: {
    "jsx-a11y/no-static-element-interactions": "warn",

    "react/jsx-filename-extension": [ "warn", { extensions: [ ".jsx" ] }],
    "react/prefer-stateless-function": "off",
    "react/prop-types": "off",
    "react/no-multi-comp": "off",
    "react/sort-comp": [
      "warn",
      {
        order: [
          "static-methods",
          "lifecycle",
          "/^on.+$/",
          "/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/",
          "everything-else",
          "/^render.+$/",
          "render",
        ],
      },
    ],
  },
}
