"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var minimist_1 = __importDefault(require("minimist"));
var path_1 = __importDefault(require("path"));
var fs_1 = require("fs");
var webpack_1 = __importDefault(require("webpack"));
var chalk_1 = __importDefault(require("chalk"));
var utils_1 = require("./utils");
var webpack_2 = __importDefault(require("./webpack"));
var config_1 = require("./config");
var upload_1 = __importDefault(require("./upload"));
var usageString = "usage:\nmwxpack serve [-c mwxpack.config.js]\nmwxpack build [-c mwxpack.config.js]\nmwxpack inspect [-c mwxpack.config.js] > config.js\nmwxpack upload [-v 1.0.0] [-d description] [-c mwxpack.config.js]";
var services = ['serve', 'build', 'inspect', 'upload'];
function parseArg(_args) {
    // 空命令
    if (!_args.length) {
        utils_1.error(usageString);
        process.exit(-1);
    }
    // 服务
    var service = _args[0];
    if (!services.includes(service)) {
        utils_1.warn('不支持的服务');
        utils_1.error(usageString);
        process.exit(-1);
    }
    // 参数
    var args = minimist_1.default(_args.slice(1));
    return { service: service, args: args };
}
exports.parseArg = parseArg;
function loadConfiguration(args, service) {
    return __awaiter(this, void 0, void 0, function () {
        var config, configFilePath, configFile, fileConfig, _config, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = config_1.defaultConfig;
                    configFilePath = args.c || 'mwxpack.config.js';
                    configFile = path_1.default.resolve(process.cwd(), configFilePath);
                    if (!fs_1.existsSync(configFile)) return [3 /*break*/, 5];
                    fileConfig = void 0;
                    try {
                        fileConfig = require(configFile);
                    }
                    catch (err) {
                        utils_1.error('配置文件加载失败');
                        console.error(err);
                        process.exit(-1);
                    }
                    if (typeof fileConfig === 'function') {
                        fileConfig = fileConfig();
                    }
                    if (!fileConfig || typeof fileConfig !== 'object') {
                        utils_1.error('配置文件必须导出一个对象');
                        process.exit(-1);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, config_1.validate(fileConfig)
                        // 判断是否是单项目模式
                    ];
                case 2:
                    _config = _a.sent();
                    // 判断是否是单项目模式
                    config._isSingle = !(config.projects && config.projects.length);
                    // 合并默认配置
                    config = Object.assign({}, config_1.defaultConfig, _config);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    utils_1.error('配置文件错误');
                    console.error(err_1);
                    process.exit(-1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    if (args.c) {
                        utils_1.error('配置文件不存在');
                        process.exit(-1);
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/, {
                        config: config,
                        configuration: webpack_2.default(config, service === 'build' ? 'production' : 'development')
                    }];
            }
        });
    });
}
exports.loadConfiguration = loadConfiguration;
function logStats(stats) {
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false,
        entrypoints: false
    }) + '\n\n');
}
function webpackHandler(err, stats, isProd) {
    if (isProd === void 0) { isProd = true; }
    if (err) {
        throw err;
    }
    if (Array.isArray(stats.stats)) {
        stats.stats.forEach(function (_stats) {
            logStats(_stats);
        });
    }
    else {
        logStats(stats.stats);
    }
    if (stats.hasErrors()) {
        if (isProd) {
            utils_1.error('构建发生错误');
            process.exit(-1);
        }
        return;
    }
    console.log(chalk_1.default.cyan('  Build complete.\n'));
}
function devWebpackHandler(err, stats) {
    return webpackHandler(err, stats, false);
}
function run(_args) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, service, args, _b, config, configuration, compiler;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = parseArg(_args), service = _a.service, args = _a.args;
                    return [4 /*yield*/, loadConfiguration(args, service)];
                case 1:
                    _b = _c.sent(), config = _b.config, configuration = _b.configuration;
                    if (service === 'inspect') {
                        return [2 /*return*/, console.log(configuration)];
                    }
                    compiler = webpack_1.default(configuration);
                    if (service === 'build') {
                        compiler.run(webpackHandler);
                    }
                    else if (service === 'serve') {
                        compiler.watch({
                            aggregateTimeout: 300,
                            poll: undefined
                        }, devWebpackHandler);
                    }
                    else if (service === 'upload') {
                        upload_1.default(config, args);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = run;
