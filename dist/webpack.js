"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var webpack_1 = require("webpack");
var case_sensitive_paths_webpack_plugin_1 = __importDefault(require("case-sensitive-paths-webpack-plugin"));
var friendly_errors_webpack_plugin_1 = __importDefault(require("friendly-errors-webpack-plugin"));
var copy_webpack_plugin_1 = __importDefault(require("copy-webpack-plugin"));
var webpack_bundle_analyzer_1 = require("webpack-bundle-analyzer");
var webpack_merge_1 = __importDefault(require("webpack-merge"));
var currentDir = process.cwd();
// 通用资源加载器
function commonAssetLoader(test, prefix) {
    return {
        test: test,
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: 4096,
                    fallback: {
                        loader: 'file-loader',
                        options: {
                            name: prefix + "/[name].[hash:8].[ext]"
                        }
                    }
                }
            }
        ]
    };
}
// 通用样式加载器
function commonStyleLoader(test, name, options) {
    var ret = {
        test: test,
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
    };
    if (name) {
        var lastLoader = {
            loader: name + "-loader",
            options: {
                sourceMap: false
            }
        };
        if (options) {
            lastLoader.options = Object.assign(lastLoader.options, options);
        }
        ret.use.push(lastLoader);
    }
    return ret;
}
// 获取项目的相对路径
function resolveCurrentPath(_path) {
    return path_1.default.resolve(currentDir, _path);
}
function generateConfig(config, mode, watch) {
    // 全局src目录
    var srcPath = resolveCurrentPath(config.srcDir);
    // mpx专用，默认为true
    var isMpx = process.env.MPX_ENABLE || true;
    // 默认复制的目录
    var copyDirs = config.copyDirs ? (Array.isArray(config.copyDirs) ? config.copyDirs : [config.copyDirs]) : [];
    return config.projects.map(function (project) {
        var ret = {
            cache: watch,
            // cache: mode !== 'production',
            // 优先使用配置文件的全局配置
            mode: config.mode || mode,
            context: currentDir,
            devtool: false,
            entry: {
                app: path_1.default.resolve(srcPath, project, isMpx ? 'app.mpx' : 'app.js')
            },
            output: {
                path: path_1.default.resolve(currentDir, config.outputDir, project),
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
                modules: ['node_modules', path_1.default.resolve(__dirname, '../node_modules'), path_1.default.resolve(currentDir, 'node_modules')]
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
                new webpack_1.DefinePlugin({
                    NODE_ENV: mode === 'production' ? '"production"' : '"development"'
                }),
                new case_sensitive_paths_webpack_plugin_1.default(),
                new friendly_errors_webpack_plugin_1.default(),
                new webpack_1.ProgressPlugin(),
                new copy_webpack_plugin_1.default(copyDirs.map(function (dir) {
                    return {
                        from: path_1.default.resolve(srcPath, project, dir),
                        to: path_1.default.resolve(config.outputDir, project),
                        toType: 'dir',
                        ignore: ['.DS_Store']
                    };
                }))
            ],
            performance: {
                hints: false
            }
        };
        // mpx专用
        if (isMpx) {
            var MpxWebpackPlugin = require('@mpxjs/webpack-plugin');
            ret = webpack_merge_1.default(ret, {
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
            });
        }
        // 构建报告
        if (process.env.npm_config_report && ret.plugins) {
            ret.plugins.push(new webpack_bundle_analyzer_1.BundleAnalyzerPlugin({
                logLevel: 'warn',
                openAnalyzer: false,
                analyzerMode: 'static'
            }));
        }
        // 合并项目自定义的配置
        if (config && config.webpackConfiguration) {
            var customWebpackConfiguration = config.webpackConfiguration;
            if (typeof customWebpackConfiguration === 'function') {
                customWebpackConfiguration = customWebpackConfiguration(project);
            }
            ret = webpack_merge_1.default(ret, customWebpackConfiguration);
        }
        return ret;
    });
}
exports.default = generateConfig;
