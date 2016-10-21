var preset = {
  presets: [
    [ require("babel-preset-es2015").buildPreset, { "modules": false } ],
    require("babel-preset-stage-0"),
    require("babel-preset-react")
  ],
  plugins: [
    require("babel-plugin-ramda").default
  ]
}

if (process.env.NODE_ENV === "production") {
  preset.plugins.push(require("babel-plugin-transform-react-constant-elements"))
  preset.plugins.push(require("babel-plugin-transform-react-remove-prop-types").default)
  preset.plugins.push(require("babel-plugin-transform-react-pure-class-to-function"))
} else {
  preset.plugins.push(require("react-hot-loader/babel"))
  preset.plugins.push(require("babel-plugin-typecheck").default)
}

module.exports = preset;
