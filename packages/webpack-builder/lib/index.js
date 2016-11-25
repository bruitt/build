let minimist = require('minimist')
let path = require('path')

let AggressiveMergingPlugin = require('webpack/lib/optimize/AggressiveMergingPlugin')
let UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin')

let CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
let DefinePlugin = require('webpack/lib/DefinePlugin')
let ProvidePlugin = require('webpack/lib/ProvidePlugin')
let LoaderOptionsPlugin = require('webpack/lib/LoaderOptionsPlugin')
let NoErrorsPlugin = require('webpack/lib/NoErrorsPlugin')

let StatsPlugin = require('stats-webpack-plugin')
let ExtractTextPlugin = require('extract-text-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')

let postcssBundle = require('@bruitt/postcss-bundle').default

let argv = minimist(process.argv.slice(2)).env || {}
let target = process.env.TARGET || process.env.NODE_ENV || 'development'

let Globals = {}

Globals.DEBUG = (target === 'development')

Globals.devServer = Globals.DEBUG && !!argv.devServer
Globals.commonChunks = true
Globals.longTermCaching = !Globals.devServer
Globals.minimize = !Globals.DEBUG

Globals.colors = !argv.nocolors

Globals.devServerPort = 3808
Globals.publicPath = '/'

Globals.styles = {}
Globals.styles.extractCss = Globals.longTermCaching && !Globals.DEBUG
Globals.styles.cssMangling = !Globals.DEBUG
Globals.styles.localIdentName = 'ns-[name]-[local]'

Globals.output = {}
Globals.output.js = 'assets/js/[name].[chunkhash].js'
Globals.output.css = 'assets/css/[name].[contenthash].css'
Globals.output.media = 'assets/media/[name].[hash].[ext]'

process.env.TARGET = target
process.env.NODE_ENV = Globals.DEBUG ? 'development' : 'production'
process.env.BABEL_ENV = Globals.DEBUG ? 'development' : 'production'

function getStyleLoaders({ fallbackLoader, loaders, shouldExtract }) {
  return shouldExtract ?
    [ ExtractTextPlugin.extract({ fallbackLoader, loaders }) ] :
    [ fallbackLoader, ...loaders ]
}

function webpackBuilder(appConfig, envConfig) {
  envConfig.HISTORY = appConfig.history || {}
  envConfig.NODE_ENV = process.env.NODE_ENV
  envConfig.TARGET = process.env.TARGET

  let processEnv = {}
  Object.keys(envConfig).forEach((key) => {
    processEnv[key] = JSON.stringify(envConfig[key])
  })

  Globals = Object.assign({}, Globals, appConfig.globals)
  Globals.styles = Object.assign({}, Globals.styles, appConfig.styles)
  Globals.output = Object.assign({}, Globals.output, appConfig.output)

  Globals.srcScriptsDir = path.resolve(appConfig.globals.srcScriptsDir)
  Globals.buildScriptsDir = path.resolve(appConfig.globals.buildScriptsDir)

  let localIdentName = Globals.styles.cssMangling ? '[hash:base64]'
    : Globals.styles.localIdentName || 'ns-[name]-[local]'

  let config = {
    cache: Globals.DEBUG,

    entry: appConfig.entries,

    devtool: Globals.DEBUG ?
      'cheap-module-source-map' :
      'module-hidden-source-map',

    output: {
      path: Globals.buildScriptsDir,
      publicPath: Globals.publicPath,
      filename: Globals.longTermCaching ? Globals.output.js :
        Globals.output.js.replace('.[chunkhash]', '')
    },

    stats: {
      colors: Globals.colors,
      reasons: Globals.DEBUG
    },

    plugins: [
      new LoaderOptionsPlugin({
        debug: Globals.DEBUG,
        minimize: Globals.MINIMIZE,
        options: {
          postcss: postcssBundle(Globals.styles.browserStack || '')
        }
      }),
      new ProvidePlugin({
        R: 'ramda'
      }),
      new DefinePlugin({
        'process.env': processEnv
      }),
      new StatsPlugin('manifest.json', {
        chunkModules: false,
        source: false,
        chunks: false,
        modules: false,
        assets: true
      })
    ],

    resolve: {
      modules: [ Globals.srcScriptsDir, 'node_modules' ],
      extensions: [ '.js', '.jsx' ]
    },

    module: {
      loaders: [
        {
          test: /\.css$/,
          loaders: getStyleLoaders({
            fallbackLoader: 'style-loader',
            loaders: [
              {
                loader: 'css-loader',
                query: {
                  importLoaders: 1
                }
              }, {
                loader: 'postcss-loader',
                query: {
                  parser: 'postcss-scss'
                }
              }
            ],
            shouldExtract: Globals.styles.extractCss
          })
        }, {
          test: /\.pcss$/,
          loaders: getStyleLoaders({
            fallbackLoader: 'style-loader',
            loaders: [
              {
                loader: 'css-loader',
                query: {
                  importLoaders: 1,
                  modules: true,
                  localIdentName
                }
              }, {
                loader: 'postcss-loader',
                query: {
                  parser: 'postcss-scss'
                }
              }
            ],
            shouldExtract: Globals.styles.extractCss
          })
        }, {
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        }, {
          test: /\.(png|woff|woff2|eot|ttf|svg|gif|jpg|jpeg|bmp)(\?.*$|$)/,
          loaders: (Globals.DEBUG ? [
            {
              loader: 'file-loader',
              query: {
                name: Globals.output.media
              }
            }
          ] : [
            {
              loader: 'url-loader',
              query: {
                name: Globals.output.media,
                limit: 12000
              }
            },
          ]).concat((Globals.minimize && !!appConfig.images) ? [
            {
              loader: 'image-webpack-loader',
              query: appConfig.images || {}
            }
          ] : []),
          exclude: /symbol/
        }, {
          test: /symbol(.*)\.svg$/,
          loader: 'svg-sprite-loader'
        }
      ]
    }
  }

  if (Globals.styles.extractCss) {
    config.plugins.push(
      new ExtractTextPlugin(Globals.output.css, {
        allChunks: true
      })
    )
  }

  if (Globals.commonChunks && Array.isArray(appConfig.commons)) {
    let commons = appConfig.commons.map((chunk) => {
      return new CommonsChunkPlugin(chunk)
    })
    config.plugins = config.plugins.concat(commons)
  }

  if (Array.isArray(appConfig.htmls)) {
    let htmls = appConfig.htmls.map((item) => {
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
          minifyURLs: true
        }
      }, item))
    })
    config.plugins = config.plugins.concat(htmls)
  }

  if (Globals.minimize) {
    config.plugins.push(
      new UglifyJsPlugin({
        compress: {
          screw_ie8: true,
          warnings: false
        },
        mangle: {
          screw_ie8: true
        },
        output: {
          comments: false,
          screw_ie8: true
        }
      }),
      new AggressiveMergingPlugin()
    )
  }

  if (Globals.devServer) {
    config.devServer = {
      port: Globals.devServerPort,
      headers: { 'Access-Control-Allow-Origin': '*' },
      historyApiFallback: true
    }

    config.plugins.push(new NoErrorsPlugin())

    if (appConfig.proxy) {
      config.devServer.proxy = appConfig.proxy
    }

    if (appConfig.historyApiFallback) {
      config.devServer.historyApiFallback = appConfig.historyApiFallback
    }
  }

  return config
}

module.exports = webpackBuilder
