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
var defaultConfig = {
    srcDir: path_1.default.resolve(currentDir, 'src'),
    outpuDir: path_1.default.resolve(currentDir, 'dist'),
    copyDirs: []
};
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
function generateConfig(config, mode) {
    var options = Object.assign({}, defaultConfig, config);
    var isSingleProject = !Array.isArray(options.projects);
    var projects = isSingleProject ? [options.projects] : options.projects;
    var copyDirs = options.copyDirs ? (Array.isArray(options.copyDirs) ? options.copyDirs : [options.copyDirs]) : [];
    return projects.map(function (project) {
        var ret = {
            mode: mode,
            context: currentDir,
            devtool: false,
            entry: {
                app: path_1.default.resolve(options.srcDir, project, 'app.js')
            },
            output: {
                path: path_1.default.resolve(currentDir, "" + options.outpuDir + (isSingleProject ? '' : "/" + project)),
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
                    path_1.default.resolve(currentDir, 'node_modules')
                ]
            },
            resolveLoader: {
                modules: [
                    'node_modules',
                    path_1.default.resolve(__dirname, '../node_modules'),
                    path_1.default.resolve(currentDir, 'node_modules')
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
                            path_1.default.resolve(options.srcDir)
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
                new webpack_1.DefinePlugin({
                    NODE_ENV: mode === 'production' ? '"production"' : '"development"'
                }),
                new case_sensitive_paths_webpack_plugin_1.default(),
                new friendly_errors_webpack_plugin_1.default(),
                new webpack_1.ProgressPlugin(),
                new copy_webpack_plugin_1.default(copyDirs.map(function (dir) {
                    return {
                        from: path_1.default.resolve(options.srcDir, isSingleProject ? '' : project, dir),
                        to: path_1.default.resolve(options.outpuDir, isSingleProject ? '' : project),
                        toType: 'dir',
                        ignore: [
                            '.DS_Store'
                        ]
                    };
                }))
            ]
        };
        if (process.env.npm_config_report && ret.plugins) {
            ret.plugins.push(new webpack_bundle_analyzer_1.BundleAnalyzerPlugin({
                logLevel: 'warn',
                openAnalyzer: false,
                analyzerMode: 'static'
            }));
        }
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
