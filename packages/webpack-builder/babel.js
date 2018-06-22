let presetEnv = {
  modules: process.env.BABEL_MODULES || false,
}

if (process.env.BROWSERSLIST) {
  presetEnv.target = { browsers: process.env.BROWSERSLIST.split(",") }
}

let preset = {
  presets: [
    [ require("babel-preset-env"), presetEnv ],
    require("babel-preset-stage-0"),
    require("babel-preset-react"),
  ],
  plugins: [
    [ require("babel-plugin-ramda").default, { useES: true }],
  ],
}

module.exports = preset
