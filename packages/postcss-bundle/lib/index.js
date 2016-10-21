import precss from 'precss'
import postcssAssets from 'postcss-assets'
import postcssCssnext from 'postcss-cssnext'

export default browsers => () => [
  precss,
  postcssAssets,
  postcssCssnext({
    browsers,
    url: false
  })
]
