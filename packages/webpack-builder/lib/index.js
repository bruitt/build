let minimist = require("minimist")
let path = require("path")

let AggressiveMergingPlugin = require("webpack/lib/optimize/AggressiveMergingPlugin")
let UglifyJsPlugin = require("webpack/lib/optimize/UglifyJsPlugin")

let CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin")
let DefinePlugin = require("webpack/lib/DefinePlugin")
let LoaderOptionsPlugin = require("webpack/lib/LoaderOptionsPlugin")
let NoErrorsPlugin = require("webpack/lib/NoErrorsPlugin")
let NamedModulesPlugin = require("webpack/lib/NamedModulesPlugin")

let StatsPlugin = require("stats-webpack-plugin")
let ExtractTextPlugin = require("extract-text-webpack-plugin")
let HtmlWebpackPlugin = require("html-webpack-plugin")
let PrerenderSpaPlugin = require("prerender-spa-plugin")
let { CheckerPlugin } = require("awesome-typescript-loader")

let postcssBundle = require("@bruitt/postcss-bundle").default

let argv = minimist(process.argv.slice(2)).env || {}
let target = process.env.TARGET || process.env.NODE_ENV || "development"

let Globals = {}

Globals.DEBUG = (target === "development")

Globals.devServer = Globals.DEBUG && !!argv.devServer
Globals.commonChunks = true
Globals.longTermCaching = !Globals.devServer
Globals.minimize = !Globals.DEBUG

Globals.colors = !argv.nocolors

Globals.devServerPort = 3808
Globals.publicPath = "/"

Globals.styles = {}
Globals.styles.extractCss = Globals.longTermCaching && !Globals.DEBUG
// Globals.styles.cssMangling = !Globals.DEBUG
Globals.styles.cssMangling = false
Globals.styles.localIdentName = "ns-[name]-[local]"

Globals.output = {}
Globals.output.js = "assets/js/[name].[chunkhash].js"
Globals.output.css = "assets/css/[name].[contenthash].css"
Globals.output.media = "assets/media/[name].[hash].[ext]"

Globals.images = {
  optipng: { optimizationLevel: 7 },
  gifsicle: { interlaced: false },
  pngquant: {
    quality: "65-90",
    speed: 4,
  },
  mozjpeg: { quality: 77 },
}

process.env.TARGET = target
process.env.NODE_ENV = Globals.DEBUG ? "development" : "production"
process.env.BABEL_ENV = Globals.DEBUG ? "development" : "production"

function webpackBuilder(appConfig, env) {
  let envConfig = { ...env }

  if (appConfig.history) {
    envConfig.HISTORY = appConfig.history
  } else {
    envConfig.HISTORY = {}
    Object.keys(appConfig.entries).forEach((key) => {
      // let k = (key === "index") ? "" : key
      let entry = appConfig.entries[key]
      let entryName = path.basename(entry, ".js")
      if (key !== "index") {
        envConfig.HISTORY[entryName] = { basename: `/${key}` }
      } else {
        envConfig.HISTORY[entryName] = { basename: "" }
      }
    })
  }

  function getStyleLoaders({ fallback, use, shouldExtract }) {
    return shouldExtract ?
      ExtractTextPlugin.extract({ fallback, use }) :
      [ { loader: fallback }, ...use ]
  }

  function getFileLoader() {
    return (Globals.DEBUG ? [
      {
        loader: "file-loader",
        options: {
          name: Globals.output.media,
        },
      },
    ] : [
      {
        loader: "url-loader",
        options: {
          name: Globals.output.media,
          limit: 12000,
        },
      },
    ]).concat((Globals.minimize && !!appConfig.images) ? [
      {
        loader: "image-webpack-loader",
        options: Globals.images,
      },
    ] : [])
  }

  envConfig.NODE_ENV = process.env.NODE_ENV
  envConfig.TARGET = process.env.TARGET

  let processEnv = {}
  Object.keys(envConfig).forEach((key) => {
    processEnv[key] = JSON.stringify(envConfig[key])
  })

  Globals = Object.assign({}, Globals, appConfig.globals)
  Globals.styles = Object.assign({}, Globals.styles, appConfig.styles)
  Globals.output = Object.assign({}, Globals.output, appConfig.output)
  Globals.images = Object.assign({}, Globals.images, appConfig.images)
  Globals.transpilePackages = Globals.transpilePackages.concat(appConfig.transpilePackages || [])

  Globals.browserslist = appConfig.browserslist || [ "> 1%", "IE 11" ]
  process.env.BROWSERSLIST = Globals.browserslist

  Globals.srcScriptsDir = path.resolve(appConfig.globals.srcScriptsDir)
  Globals.buildScriptsDir = path.resolve(appConfig.globals.buildScriptsDir)

  let localIdentName = Globals.styles.cssMangling ? "[hash:base64]"
    : Globals.styles.localIdentName || "ns-[name]-[local]"

  let config = {
    cache: Globals.DEBUG,

    entry: appConfig.entries,

    devtool: Globals.DEBUG ?
      "cheap-module-source-map" :
      "module-hidden-source-map",

    output: {
      path: Globals.buildScriptsDir,
      publicPath: Globals.publicPath,
      filename: Globals.longTermCaching ? Globals.output.js :
        Globals.output.js.replace(".[chunkhash]", ""),
    },

    stats: {
      colors: Globals.colors,
      reasons: Globals.DEBUG,
    },

    plugins: [
      new CheckerPlugin(),
      new LoaderOptionsPlugin({
        debug: Globals.DEBUG,
        minimize: Globals.MINIMIZE,
        options: {
          postcss: postcssBundle(Globals.browserslist),
        },
      }),
      new DefinePlugin({
        "process.env": processEnv,
      }),
      new StatsPlugin("manifest.json", {
        chunkModules: false,
        source: false,
        chunks: false,
        modules: false,
        assets: true,
      }),
    ],

    resolve: {
      alias: appConfig.alias || {},
      extensions: [ ".ts", ".tsx", ".js", ".jsx" ]
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: getStyleLoaders({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  minimize: Globals.minimize,
                },
              }, {
                loader: "postcss-loader",
                options: {
                  parser: "postcss-scss",
                },
              },
            ],
            shouldExtract: Globals.styles.extractCss,
          }),
        }, {
          test: /\.pcss$/,
          use: getStyleLoaders({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  minimize: Globals.minimize,
                  modules: true,
                  localIdentName,
                },
              }, {
                loader: "postcss-loader",
                options: {
                  parser: "postcss-scss",
                },
              },
            ],
            shouldExtract: Globals.styles.extractCss,
          }),
        }, {
          use: "awesome-typescript-loader",
          resource: {
            test: /\.(js|ts|jsx|tsx)?$/,
            or: [
              { include: (Globals.transpilePackages || []).map((p) => new RegExp(p)) },
              { exclude: /node_modules/ },
            ],
          },
          options: {
            useCache: true,
            useBabel: true,
          },
        }, {
          test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg|jpeg|bmp|mp4|webm)(\?.*$|$)/,
          use: getFileLoader(),
          exclude: /symbol/,
        }, {
          test: /symbol(.*)\.svg$/,
          use: "svg-sprite-loader",
        }, {
          test: /\.md$/,
          use: [
            { loader: "html-loader" },
            { loader: "markdown-loader" },
          ],
        },
      ],
    },
  }

  if (Globals.commonChunks && Array.isArray(appConfig.commons)) {
    let commons = appConfig.commons.map((chunk) => {
      return new CommonsChunkPlugin(chunk)
    })
    config.plugins = config.plugins.concat(commons)
  }

  let { htmls } = appConfig

  if (!!htmls && !Array.isArray(htmls) && !!htmls.template) {
    htmls = Object.keys(appConfig.entries).map((key) => {
      // let k = (key === "index") ? "" : key
      return {
        template: htmls.template,
        filename: `${key}.html`,
        chunks: [ key ],
      }
    })
  }

  if (Array.isArray(htmls)) {
    let htmlPlugins = htmls.map((item) => {
      return new HtmlWebpackPlugin(Object.assign(!Globals.minimize ? {} : {
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }, item))
    })
    config.plugins = config.plugins.concat(htmlPlugins)
  }

  if (Globals.styles.extractCss) {
    config.plugins.push(
      new ExtractTextPlugin({
        filename: Globals.output.css,
        allChunks: true,
        ignoreOrder: true,
      }),
    )
  }

  if (Globals.minimize) {
    config.plugins.push(
      new UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false,
        },
        mangle: {
          screw_ie8: true,
        },
        output: {
          comments: false,
          screw_ie8: true,
        },
        sourceMap: true,
      }),
      new AggressiveMergingPlugin(),
    )
  }

  if (appConfig.prerender) {
    config.plugins.push(new PrerenderSpaPlugin(
      Globals.buildScriptsDir,
      appConfig.prerender.routes || [ "/" ],
      Object.assign({}, appConfig.prerender.options, {
        postProcessHtml: (context) => {
          return context.html.replace(
            /<span aria-hidden="true"[^>]*>[^<]*<\/span>/gi, "",
          ).replace(
            /<style type="text\/css"[^>]*>[^<]*[.tk-|typekit][^<]*<\/style>/gi, "",
          )
        },
      }),
    ))
  }

  if (Globals.devServer) {
    config.devServer = {
      port: Globals.devServerPort,
      headers: { "Access-Control-Allow-Origin": "*" },
      historyApiFallback: true,
    }

    config.plugins.push(new NoErrorsPlugin())
    config.plugins.push(new NamedModulesPlugin())

    if (appConfig.proxy) {
      config.devServer.proxy = appConfig.proxy
    }

    if (appConfig.historyApiFallback) {
      config.devServer.historyApiFallback = appConfig.historyApiFallback
    } else {
      let rewrites = Object.keys(appConfig.entries).map((key) => {
        // let k = (key === "index") ? "" : key
        return {
          from: new RegExp(`/${key}`),
          to: `/${key}.html`,
        }
      })
      config.devServer.historyApiFallback = { rewrites }
    }
  }

  return config
}

module.exports = webpackBuilder
