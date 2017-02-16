module.exports = {
  extends: [
    "eslint-config-airbnb-base",
    "eslint-config-airbnb-base/rules/strict"
  ].map(require.resolve),
  plugins: [
    "fp"
  ],
  rules: {
    "arrow-body-style": [ "off", "as-needed" ],
    "array-bracket-spacing": [ "error", "always", { "objectsInArrays": false, "arraysInArrays": false } ],
    "arrow-parens": [ "error", "always" ],
    "class-methods-use-this": [ "error", { "exceptMethods": [ "render" ] } ],
    "dot-notation": [ "error", { "allowKeywords": true, "allowPattern": "^[A-Z]+[A-Za-z]+$" } ],
    "global-require": "warn",
    "no-constant-condition": [ "error", { "checkLoops": false } ],
    "no-mixed-operators": [ "error", { "allowSamePrecedence": true } ],
    "no-underscore-dangle": [ "error", { "allowAfterThis": true } ],
    "no-unused-vars": [ "warn", { "vars": "local", "args": "after-used" } ],
    "prefer-const": "off",
    "prefer-template": "warn",
    "quotes": [ "error", "double" ],
    "semi": [ "error", "never" ],
    "vars-on-top": "off",

    "import/no-extraneous-dependencies": [ "off" ],
    "import/no-mutable-exports": "off",
    "import/prefer-default-export": "warn",

    "fp/no-arguments": "error",
    "fp/no-delete": "error",
    "fp/no-events": "error",
    "fp/no-get-set": "error",
    "fp/no-let": "off",
    "fp/no-loops": "error",
    "fp/no-mutating-assign": "error",
    "fp/no-mutating-methods": "error",
    "fp/no-proxy": "error",
    "fp/no-rest-parameters": "error",
    "fp/no-throw": "error",
    "fp/no-valueof-field": "error",

    // muted
    "fp/no-class": "off",
    "fp/no-mutation": "off",
    "fp/no-nil": "off",
    "fp/no-this": "off",
    "fp/no-unused-expression": "off",
  }
}
