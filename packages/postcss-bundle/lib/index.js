import precss from "precss"
import postcssAssets from "postcss-assets"
import postcssCssnext from "postcss-cssnext"

export default (browsers) => () => [
  precss,
  postcssAssets,
  postcssCssnext({
    browsers,
    features: {
      autoprefixer: {
        flexbox: "no-2009",
      },
    },
  }),
]
