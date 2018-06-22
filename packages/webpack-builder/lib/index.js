let minimist = require("minimist")
let path = require("path")

let proxy = require("http-proxy-middleware")
let history = require("connect-history-api-fallback")
let convert = require("koa-connect")

let DefinePlugin = require("webpack/lib/DefinePlugin")

let ManifestPlugin = require("webpack-manifest-plugin")
let MiniCssExtractPlugin = require("mini-css-extract-plugin")
let HtmlWebpackPlugin = require("html-webpack-plugin")
let HtmlWebpackExcludeAssetsPlugin = require("html-webpack-exclude-assets-plugin")
let CopyWebpackPlugin = require("copy-webpack-plugin")
let SentryPlugin = require("webpack-sentry-plugin")

let postcssBundle = require("@bruitt/postcss-bundle").default

let babelOptions = require("../babel")

let argv = minimist(process.argv.slice(2)).env || {}
let target = process.env.TARGET || process.env.NODE_ENV || "production"

let Globals = {}

Globals.DEBUG = target === "development"

Globals.devServer = Globals.DEBUG && !!argv.devServer
// Globals.commonChunks = true
Globals.longTermCaching = !Globals.devServer
Globals.minimize = !Globals.DEBUG

Globals.colors = !argv.nocolors

Globals.devServerPort = 3808
Globals.publicPath = "/"

Globals.styles = {}
Globals.styles.extractCss = Globals.longTermCaching && !Globals.DEBUG
Globals.styles.cssMangling = false
Globals.styles.localIdentName = "ns-[name]-[local]"

let assetsDir = process.env.CDN_URL ? "" : "assets/"
Globals.output = {}
Globals.output.js = `${assetsDir}js/[name].[chunkhash].js`
Globals.output.css = `${assetsDir}css/[name].[hash].css`
Globals.output.cssChunk = `${assetsDir}css/[id].[hash].css`
Globals.output.media = `${assetsDir}media/[name].[hash].[ext]`

Globals.images = {
  optipng: { optimizationLevel: 7 },
  gifsicle: { interlaced: false },
  pngquant: {
    quality: "65-90",
    speed: 4,
  },
  mozjpeg: { quality: 77 },
  svgo: {
    plugins: [{ collapseGroups: false }],
  },
}

Globals.transpilePackages = [ "@bruitt/app-entry", "preact-compat" ]

process.env.TARGET = target
process.env.NODE_ENV = Globals.DEBUG ? "development" : "production"
process.env.BABEL_ENV = Globals.DEBUG ? "development" : "production"

function webpackBuilder(appConfig, env) {
  function getStyleLoaders({ fallback, use, shouldExtract }) {
    return shouldExtract
      ? [ MiniCssExtractPlugin.loader, ...use ]
      : [{ loader: fallback }, ...use ]
  }

  function getFileLoader() {
    return Globals.DEBUG
      ? [
        {
          loader: "file-loader",
          options: {
            name: Globals.output.media,
          },
        },
      ]
      : [
        {
          loader: "url-loader",
          options: {
            name: Globals.output.media,
            limit: 12000,
          },
        },
      ].concat(
          Globals.minimize === true || Globals.minimize.images
            ? [
              {
                loader: "image-webpack-loader",
                options: Globals.images,
              },
            ]
            : [],
        )
  }

  Globals = Object.assign({}, Globals, appConfig.globals)
  Globals.styles = Object.assign({}, Globals.styles, appConfig.styles)
  Globals.output = Object.assign({}, Globals.output, appConfig.output)
  Globals.images = Object.assign({}, Globals.images, appConfig.images)
  Globals.transpilePackages = Globals.transpilePackages.concat(
    appConfig.transpilePackages || [],
  )

  Globals.browserslist = appConfig.browserslist || [ "> 1%", "IE 11" ]
  process.env.BROWSERSLIST = Globals.browserslist

  Globals.srcScriptsDir = path.resolve(appConfig.globals.srcScriptsDir)
  Globals.buildScriptsDir = path.resolve(appConfig.globals.buildScriptsDir)

  let localIdentName = Globals.styles.cssMangling
    ? "[hash:base64]"
    : Globals.styles.localIdentName || "ns-[name]-[local]"

  let config = {
    mode: Globals.DEBUG ? "development" : "production",

    entry: appConfig.entries,

    devtool: Globals.DEBUG ? "cheap-module-source-map" : "source-map",

    target: target === "ssr" ? "node" : "web",

    output: {
      path: Globals.buildScriptsDir,
      publicPath: process.env.CDN_URL || Globals.publicPath,
      filename: Globals.longTermCaching
        ? Globals.output.js
        : Globals.output.js.replace(".[chunkhash]", ""),
      libraryTarget: target === "ssr" ? "commonjs2" : "var",
    },

    stats: {
      colors: Globals.colors,
      reasons: Globals.DEBUG,
    },

    plugins: [
      new DefinePlugin({
        "process.env.TARGET": JSON.stringify(process.env.TARGET),
      }),
      new ManifestPlugin(),
    ],

    resolve: {
      alias: appConfig.alias || {},
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
                  minimize: Globals.minimize === true || Globals.minimize.css,
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  parser: "postcss-scss",
                  plugins: postcssBundle(Globals.browserslist),
                },
              },
            ],
            shouldExtract: Globals.styles.extractCss,
          }),
        },
        {
          test: /\.pcss$/,
          use: getStyleLoaders({
            fallback: "style-loader",
            use: [
              {
                loader: "css-loader",
                options: {
                  importLoaders: 1,
                  minimize: Globals.minimize === true || Globals.minimize.css,
                  modules: true,
                  localIdentName,
                },
              },
              {
                loader: "postcss-loader",
                options: {
                  parser: "postcss-scss",
                  plugins: postcssBundle(Globals.browserslist),
                },
              },
            ],
            shouldExtract: Globals.styles.extractCss,
          }),
        },
        {
          use: {
            loader: "babel-loader",
            options: babelOptions,
          },
          resource: {
            test: /\.jsx?$/,
            or: [
              {
                include: (Globals.transpilePackages || []).map(
                  (p) => new RegExp(p),
                ),
              },
              { exclude: /node_modules/ },
            ],
          },
        },
        {
          test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg|jpeg|bmp|mp4|webm)(\?.*$|$)/,
          use: getFileLoader(),
          exclude: /symbol/,
        },
        {
          test: /symbol(.*)\.svg$/,
          use: "svg-sprite-loader",
        },
        {
          test: /\.md$/,
          use: [{ loader: "html-loader" }, { loader: "markdown-loader" }],
        },
      ],
    },
  }

  let { htmls } = appConfig

  if (!!htmls && !Array.isArray(htmls) && !!htmls.template) {
    htmls = Object.keys(appConfig.entries).map((key) => {
      return {
        template: htmls.template,
        filename: `${key}.html`,
        chunks: [ key ],
      }
    })
  }

  if (Array.isArray(htmls)) {
    let htmlPlugins = htmls
      .map((item) => {
        return new HtmlWebpackPlugin(
          Object.assign(
            Globals.minimize === true || Globals.minimize.html
              ? {
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
              }
              : {},
            item,
          ),
        )
      })
      .concat([ new HtmlWebpackExcludeAssetsPlugin() ])

    config.plugins = config.plugins.concat(htmlPlugins)
  }

  if (Globals.styles.extractCss) {
    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: Globals.output.css,
        chunkFilename: Globals.output.cssChunk,
      }),
    )
  }

  if (appConfig.sentry && process.env.GIT_TAG && process.env.GIT_SHA) {
    if (!process.env.SENTRY_AUTH_TOKEN || appConfig.sentry.authToken) {
      console.log("Missing sentry auth token")
    } else {
      config.plugins.push(
        new SentryPlugin({
          organization: appConfig.sentry.organization,
          project: appConfig.sentry.project,
          apiKey: process.env.SENTRY_AUTH_TOKEN || appConfig.sentry.apiKey,
          release: process.env.GIT_TAG,
          releaseBody: (version, projects) => {
            let release = { version, projects }
            if (!appConfig.github.repo) {
              return release
            }
            return {
              ...release,
              refs: [
                {
                  repository: appConfig.github.repo,
                  commit: process.env.GIT_SHA,
                },
              ],
            }
          },
        }),
      )
    }
  }

  config.plugins.push(
    new CopyWebpackPlugin(
      [
        {
          from: path.join(Globals.srcScriptsDir, "assets"),
          to: path.join(Globals.buildScriptsDir, assetsDir),
        },
      ],
      {},
    ),
  )

  if (Globals.devServer) {
    config.serve = {
      content: "src/",
      host: "0.0.0.0",
      port: Globals.devServerPort,
      open: true,
      add: (app, middleware, options) => {
        if (appConfig.proxy) {
          let proxyKeys = Object.keys(appConfig.proxy)
          proxyKeys.forEach((proxyKey) => {
            app.use(convert(proxy(proxyKey, appConfig.proxy[proxyKey])))
          })
        }
        app.use(convert(history()))
      },
      // headers: { "Access-Control-Allow-Origin": "*" },
    }

    // if (appConfig.historyApiFallback) {
    //   config.devServer.historyApiFallback = appConfig.historyApiFallback
    // } else {
    //   let rewrites = Object.keys(appConfig.entries).map((key) => {
    //     // let k = (key === "index") ? "" : key
    //     return {
    //       from: new RegExp(`/${key}`),
    //       to: `/${key}.html`,
    //     }
    //   })
    //   config.devServer.historyApiFallback = { rewrites }
    // }
  }

  return config
}

module.exports = webpackBuilder
