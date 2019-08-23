import path from 'path'
import { DefinePlugin, ProgressPlugin, RuleSetRule, Configuration } from 'webpack'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import merge from 'webpack-merge'
import { FileConfig } from './config'

const currentDir = process.cwd()

const defaultConfig = {
  srcDir: path.resolve(currentDir, 'src'),
  outpuDir: path.resolve(currentDir, 'dist'),
  copyDirs: []
}

function commonAssetLoader (test: RegExp, prefix: string): RuleSetRule {
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

function commonStyleLoader (test: RegExp, name?: string, options?: object): RuleSetRule {
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

export default function generateConfig (config: FileConfig | null, mode: 'development' | 'production' | 'none'): Configuration[] {
  const options = Object.assign({}, defaultConfig, config)
  const isSingleProject = !Array.isArray(options.projects)
  const projects = isSingleProject ? [<string>options.projects] : <string[]>options.projects
  const copyDirs = options.copyDirs ? (Array.isArray(options.copyDirs) ? options.copyDirs : [options.copyDirs]) : []
  return projects.map<Configuration>(project => {
    let ret: Configuration = {
      mode: mode,
      context: currentDir,
      devtool: false,
      entry: {
        app: path.resolve(options.srcDir, project, 'app.js')
      },
      output: {
        path: path.resolve(currentDir, `${options.outpuDir}${isSingleProject ? '' : `/${project}`}`),
        filename: '[name].js',
        publicPath: '/',
        globalObject: 'wx',
      },
      resolve: {
        alias: {
          '@': defaultConfig.srcDir
        },
        extensions: [
          '.mjs',
          '.js',
          '.json'
        ],
        modules: [
          'node_modules',
          path.resolve(currentDir, 'node_modules')
        ]
      },
      resolveLoader: {
        modules: [
          'node_modules',
          path.resolve(__dirname, '../node_modules'),
          path.resolve(currentDir, 'node_modules')
        ]
      },
      devServer: {
        writeToDisk: true
      },
      module: {
        rules: [
          // pre js loader
          {
            enforce: 'pre',
            test: /\.m?js$/,
            exclude: [
              /node_modules/
            ],
            use: [
              {
                loader: 'eslint-loader',
                options: {
                  extensions: [
                    '.js'
                  ],
                  cache: true,
                  emitWarning: true,
                  emitError: false
                }
              }
            ]
          },
          // js loader
          {
            test: /\.m?js$/,
            include: [
              path.resolve(options.srcDir)
            ],
            use: ['cache-loader', 'babel-loader']
          },
          // json loader
          {
            test: /\.json$/,
            resourceQuery: /__component/,
            type: 'javascript/auto'
          },
          // images loader
          commonAssetLoader(/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/, 'img'),
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
          commonStyleLoader(/\.styl(us)?$/, 'stylus', { preferPathResolver: 'webpack' }),
        ]
      },
      plugins: [
        new DefinePlugin({
          NODE_ENV: mode === 'production' ? '"production"' : '"development"'
        }),
        new CaseSensitivePathsPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        new ProgressPlugin(),
        new CopyWebpackPlugin(copyDirs.map(dir => {
          return {
            from: path.resolve(options.srcDir, isSingleProject ? '' : project, dir),
            to: path.resolve(options.outpuDir, isSingleProject ? '' : project),
            toType: 'dir',
            ignore: [
              '.DS_Store'
            ]
          }
        }))
      ]
    }
    if (process.env.npm_config_report && ret.plugins) {
      ret.plugins.push(new BundleAnalyzerPlugin({
        logLevel: 'warn',
        openAnalyzer: false,
        analyzerMode: 'static'
      }))
    }
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
