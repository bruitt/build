import * as precss from "precss"
import * as postcssAssets from "postcss-assets"
import * as postcssCssnext from "postcss-cssnext"

let postcssBundle = (browsers: string[]) => () => [
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

export default postcssBundle
