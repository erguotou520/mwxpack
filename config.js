const path = require('path')
// const { DefinePlugin, ProgressPlugin } = require('webpack')
const webpack = require('webpack')
// const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
// const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const MpxWebpackPlugin = require('../../qtjf/wxapp-v2/node_modules/@mpxjs/webpack-plugin')

function commonAssetLoader (test, prefix) {
  return {
    test,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 4096,
          fallback: {
            loader: 'file-loader',
            options: {
              name: `${prefix}/[name].[hash:8].[ext]`
            }
          }
        }
      }
    ]
  }
}

function commonStyleLoader (test, name, options) {
  const ret = {
    test,
    use: [
      {
        loader: 'css-loader',
        options: {
          sourceMap: false,
          importLoaders: 2
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: false
        }
      }
    ]
  }
  if (name) {
    const lastLoader = {
      loader: `${name}-loader`,
      options: {
        sourceMap: false
      }
    }
    if (options) {
      lastLoader.options = Object.assign(lastLoader.options, options)
    }
    ret.use.push(lastLoader)
  }
  return ret
}

// const config = {
//   mode: 'development',
//   context: '/Users/erguotou/workspace/qtjf/wxapp-v2',
//   devtool: false,
//   node: false,
//   target: 'web',
//   entry: {
//     app: '/Users/erguotou/workspace/qtjf/wxapp-v2/src/qingtongcs/app.mpx'
//   },
//   output: {
//     path: '/Users/erguotou/workspace/qtjf/wxapp-v2/dist/qingtongcs',
//     filename: '[name].js'
//   },
//   resolve: {
//     alias: {
//       '@': '/Users/erguotou/workspace/qtjf/wxapp-v2/src/'
//     },
//     extensions: [
//       '.mjs',
//       '.js',
//       '.json'
//     ],
//     modules: [
//       'node_modules',
//       '/Users/erguotou/workspace/qtjf/wxapp-v2/node_modules'
//     ]
//   },
//   resolveLoader: {
//     modules: [
//       'node_modules',
//       '/Users/erguotou/workspace/erguotou/mwxpack/node_modules',
//       '/Users/erguotou/workspace/qtjf/wxapp-v2/node_modules'
//     ]
//   },
//   devServer: { writeToDisk: true },
//   module: {
//     rules: [
//       // pre js loader
//       {
//         enforce: 'pre',
//         test: /\.m?js$/,
//         include: [
//           '/Users/erguotou/workspace/qtjf/wxapp-v2/src/'
//         ],
//         exclude: [
//           /node_modules/
//         ],
//         use: [
//           {
//             loader: 'eslint-loader',
//             options: {
//               extensions: [
//                 '.js'
//               ],
//               cache: true,
//               emitWarning: true,
//               emitError: false
//             }
//           }
//         ]
//       },
//       // js loader
//       {
//         test: /\.m?js$/,
//         include: [
//           '/Users/erguotou/workspace/qtjf/wxapp-v2/src/'
//         ],
//         use: ['cache-loader', 'babel-loader']
//       },
//       // json loader
//       {
//         test: /\.json$/,
//         resourceQuery: /__component/,
//         type: 'javascript/auto'
//       },
//       {
//         test: /\.mpx$/,
//         use: MpxWebpackPlugin.loader({
//           transRpx: {
//             mode: 'only',
//             comment: 'use rpx',
//             include: [
//               '/Users/erguotou/workspace/qtjf/wxapp-v2/src/'
//             ]
//           }
//         })
//       },
//       // images loader
//       commonAssetLoader(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/, 'img'),
//       // media loader
//       commonAssetLoader(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, 'media'),
//       // font loader
//       commonAssetLoader(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i, 'fonts'),
//       // css loader
//       commonStyleLoader(/\.(css|p(ost)?css)$/),
//       // scss loader
//       commonStyleLoader(/\.scss$/, 'sass'),
//       // sass loader
//       commonStyleLoader(/\.sass$/, 'sass'),
//       // less loader
//       commonStyleLoader(/\.less$/, 'less'),
//       // stylus loader
//       commonStyleLoader(/\.styl(us)?$/, 'stylus', { preferPathResolver: 'webpack' }),
//     ]
//   },
//   plugins: [
//     new DefinePlugin({
//       'process.env': {
//         NODE_ENV: '"production"'
//       }
//     }),
//     new CaseSensitivePathsPlugin(),
//     new FriendlyErrorsWebpackPlugin(),
//     new ProgressPlugin(),
//     // new CopyWebpackPlugin(copyDirs.map(dir => {
//     //   return {
//     //     from: path.resolve(currentDir, isSingleProject ? '' : project, dir),
//     //     to: path.resolve(options.outpuDir, isSingleProject ? '' : project, dir),
//     //     toType: 'dir',
//     //     ignore: [
//     //       '.DS_Store'
//     //     ]
//     //   }
//     // })),
//     new MpxWebpackPlugin({ mode: 'wx' })
//   ],
//   optimization: {
//     runtimeChunk: {
//       name: 'bundle'
//     },
//     noEmitOnErrors: false,
//     splitChunks: {
//       cacheGroups: {
//         main: {
//           name: 'bundle',
//           minChunks: 2,
//           chunks: 'initial'
//         },
//         // 分包内抽取bundle示例配置，传入分包root数组
//         // ...getSubPackagesCacheGroups(Array<subpackage root>)
//       }
//     }
//   }
// }

function resolveSrc (file) {
  return path.resolve('/Users/erguotou/workspace/qtjf/wxapp-v2/src/', file || '')
}

function resolve (dir) {
  return path.join('/Users/erguotou/workspace/qtjf/wxapp-v2/', dir)
}

const config = {
  entry: {
    app: resolveSrc('qingtongcs/app.mpx')
  },
  module: {
    rules: [
      {
        test: /\.(js|mpx)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src')],
        options: {
          // formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.mpx$/,
        use: MpxWebpackPlugin.loader({
          transRpx: {
            mode: 'only',
            comment: 'use rpx',
            include: resolve('src')
          }
        })
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/@mpxjs')],
        exclude: [resolve('node_modules/@mpxjs/webpack-plugin')]
      },
      {
        test: /\.json$/,
        resourceQuery: /__component/,
        type: 'javascript/auto'
      },
      {
        test: /\.(wxs|qs|sjs|filter\.js)$/,
        loader: MpxWebpackPlugin.wxsPreLoader(),
        enforce: 'pre'
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: MpxWebpackPlugin.urlLoader({
          name: 'img/[name][hash].[ext]'
        })
      }
    ]
  },
  output: {
    path: resolve('dist'),
    filename: '[name].js'
  },
  optimization: {
    runtimeChunk: {
      name: 'bundle'
    },
    noEmitOnErrors: false,
    splitChunks: {
      cacheGroups: {
        main: {
          name: 'bundle',
          minChunks: 2,
          chunks: 'initial'
        },
        // 分包内抽取bundle示例配置，传入分包root数组
        // ...getSubPackagesCacheGroups(Array<subpackage root>)
      }
    }
  },
  mode: 'production',
  resolve: {
    extensions: ['.js', '.mpx'],
    modules: [
      'node_modules',
      '/Users/erguotou/workspace/erguotou/mwxpack/node_modules',
      resolve('node_modules')
    ]
  },
  resolveLoader: {
    modules: [
      'node_modules',
      '/Users/erguotou/workspace/erguotou/mwxpack/node_modules',
      '/Users/erguotou/workspace/qtjf/wxapp-v2/node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'NODE_ENV': '"production"'
    }),
    new MpxWebpackPlugin({ mode: 'wx' })
  ]
}

module.exports = config

function callback (err, stats) {
  if (err) return console.error(err)
  if (Array.isArray(stats.stats)) {
    stats.stats.forEach(item => {
      console.log(item.compilation.name + '打包结果：')
      process.stdout.write(item.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
      }) + '\n\n')
    })
  } else {
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      entrypoints: false
    }) + '\n\n')
  }
}

webpack(config).run(callback)
