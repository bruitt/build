module.exports = {
  extends: [
    'stylelint-config-standard'
  ].map(require.resolve),
  rules: {
    'color-hex-length': 'long',
    'media-feature-name-no-unknown': [ true, {
      'ignoreMediaFeatureNames': [ '/device-pixel-ratio/' ]
    } ],
    'number-leading-zero': 'never',
    'selector-list-comma-newline-after': 'never-multi-line',
    'selector-pseudo-element-colon-notation': 'single',
    'selector-pseudo-class-no-unknown': [ true, {
      'ignorePseudoClasses': [ 'global' ]
    } ]
  }
}
