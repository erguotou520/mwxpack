import path from 'path'
import { DefinePlugin, ProgressPlugin, RuleSetRule, Configuration } from 'webpack'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import merge from 'webpack-merge'
import { FileConfig } from './config'

const currentDir = process.cwd()

// 通用资源加载器
function commonAssetLoader(test: RegExp, prefix: string): RuleSetRule {
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

// 通用样式加载器
function commonStyleLoader(test: RegExp, name?: string, options?: object): RuleSetRule {
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

// 获取项目的相对路径
function resolveCurrentPath(_path: string) : string {
  return path.resolve(currentDir, _path)
}

export default function generateConfig(
  config: FileConfig,
  mode: 'development' | 'production' | 'none',
  watch: boolean
): Configuration[] {
  // 全局src目录
  const srcPath = resolveCurrentPath(config.srcDir)
  // mpx专用，默认为true
  const isMpx = process.env.MPX_ENABLE || true
  // 默认复制的目录
  const copyDirs = config.copyDirs ? (Array.isArray(config.copyDirs) ? config.copyDirs : [config.copyDirs]) : []
  return config.projects.map<Configuration>(project => {
    let ret: Configuration = {
      cache: watch,
      // cache: mode !== 'production',
      // 优先使用配置文件的全局配置
      mode: config.mode || mode,
      context: currentDir,
      devtool: false,
      entry: {
        app: path.resolve(srcPath, project, isMpx ? 'app.mpx' : 'app.js')
      },
      output: {
        path: path.resolve(currentDir, config.outputDir, project),
        filename: '[name].js',
        publicPath: '/',
        globalObject: 'wx'
      },
      resolve: {
        alias: {
          '@': srcPath
        },
        extensions: ['.wxml', '.js', '.json'],
        modules: ['node_modules', resolveCurrentPath('node_modules')]
      },
      resolveLoader: {
        modules: ['node_modules', path.resolve(__dirname, '../node_modules'), path.resolve(currentDir, 'node_modules')]
      },
      devServer: {
        writeToDisk: true
      },
      module: {
        rules: [
          // pre js loader
          {
            enforce: 'pre',
            test: /\.(js|mpx)$/,
            include: [srcPath],
            loader: 'eslint-loader',
            options: {
              formatter: require('eslint-friendly-formatter')
            }
          },
          // js loader
          {
            test: /\.js$/,
            include: [srcPath],
            use: ['babel-loader']
          },
          // json loader
          {
            test: /\.json$/,
            resourceQuery: /__component/,
            type: 'javascript/auto'
          },
          // images loader
          // commonAssetLoader(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/, 'img'),
          // media loader
          commonAssetLoader(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/, 'media'),
          // font loader
          commonAssetLoader(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i, 'fonts'),
          // css loader
          commonStyleLoader(/\.(css|p(ost)?css)$/),
          // scss loader
          commonStyleLoader(/\.scss$/, 'sass'),
          // sass loader
          commonStyleLoader(/\.sass$/, 'sass'),
          // less loader
          commonStyleLoader(/\.less$/, 'less'),
          // stylus loader
          commonStyleLoader(/\.styl(us)?$/, 'stylus', { preferPathResolver: 'webpack' })
        ]
      },
      plugins: [
        new DefinePlugin({
          NODE_ENV: mode === 'production' ? '"production"' : '"development"'
        }),
        new CaseSensitivePathsPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        new ProgressPlugin(),
        new CopyWebpackPlugin(
          copyDirs.map(dir => {
            return {
              from: path.resolve(srcPath, project, dir),
              to: path.resolve(config.outputDir, project),
              toType: 'dir',
              ignore: ['.DS_Store']
            }
          })
        )
      ],
      performance: {
        hints: false
      }
    }
    // mpx专用
    if (isMpx) {
      const MpxWebpackPlugin = require('@mpxjs/webpack-plugin')
      ret = merge(ret, {
        resolve: {
          extensions: ['.mpx']
        },
        module: {
          rules: [
            {
              // mpx babel
              test: /\.mpx$/,
              include: [srcPath],
              use: MpxWebpackPlugin.loader({
                transRpx: {
                  mode: 'only',
                  comment: 'use rpx',
                  include: srcPath
                }
              })
            },
            {
              // mpxjs/core babel
              test: /\.js$/,
              include: [resolveCurrentPath('test'), resolveCurrentPath('node_modules/@mpxjs/core')],
              exclude: [resolveCurrentPath('node_modules/@mpxjs/webpack-plugin')],
              use: 'babel-loader'
            },
            {
              // wxs
              test: /\.(wxs|qs|sjs|filter\.js)$/,
              // include: [srcPath],
              loader: MpxWebpackPlugin.wxsPreLoader(),
              enforce: 'pre'
            },
            {
              test: /\.(png|jpe?g|gif|svg)$/,
              // include: [srcPath],
              loader: MpxWebpackPlugin.fileLoader({
                name: 'img/[name].[ext]'
              })
            }
          ]
        },
        plugins: [
          new MpxWebpackPlugin({
            mode: 'wx', writeMode: 'changed'
          })
        ]
      })
    }
    // 构建报告
    if (process.env.npm_config_report && ret.plugins) {
      ret.plugins.push(
        new BundleAnalyzerPlugin({
          logLevel: 'warn',
          openAnalyzer: false,
          analyzerMode: 'static'
        })
      )
    }
    // 合并项目自定义的配置
    if (config && config.webpackConfiguration) {
      let customWebpackConfiguration = config.webpackConfiguration
      if (typeof customWebpackConfiguration === 'function') {
        customWebpackConfiguration = customWebpackConfiguration(project)
      }
      ret = merge(ret, customWebpackConfiguration)
    }
    return ret
  })
}
