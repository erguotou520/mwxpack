import minimist, { ParsedArgs } from 'minimist'
import path from 'path'
import { existsSync } from 'fs'
import webpack, { Configuration, MultiCompiler, Stats } from 'webpack'
import chalk from 'chalk'
import { error, warn } from './utils'
import generateConfig from './webpack'
import { validate, FileConfig, defaultConfig } from './config'
import upload from './upload'

interface LoadConfigurationArgs {
  config: FileConfig
  configuration: Configuration[]
}

const usageString = `usage:
mwxpack serve [-c mwxpack.config.js]
mwxpack build [-c mwxpack.config.js]
mwxpack inspect [-c mwxpack.config.js] > config.js
mwxpack upload [-v 1.0.0] [-d description] [-c mwxpack.config.js]`

const services = ['serve', 'build', 'inspect', 'upload']

export function parseArg(_args: string[]): { service: string; args: ParsedArgs } {
  // 空命令
  if (!_args.length) {
    error(usageString)
    process.exit(-1)
  }
  // 服务
  const service = _args[0]
  if (!services.includes(service)) {
    warn('不支持的服务')
    error(usageString)
    process.exit(-1)
  }
  // 参数
  const args: ParsedArgs = minimist(_args.slice(1))
  return { service, args }
}

export async function loadConfiguration(args: ParsedArgs, service: string): Promise<LoadConfigurationArgs> {
  // 配置
  let config: FileConfig = defaultConfig
  const configFilePath = args.c || 'mwxpack.config.js'
  const configFile = path.resolve(process.cwd(), configFilePath)
  // 配置文件
  if (existsSync(configFile)) {
    let fileConfig
    try {
      fileConfig = require(configFile)
    } catch (err) {
      error('配置文件加载失败')
      console.error(err)
      process.exit(-1)
    }
    if (typeof fileConfig === 'function') {
      fileConfig = fileConfig()
    }
    if (!fileConfig || typeof fileConfig !== 'object') {
      error('配置文件必须导出一个对象')
      process.exit(-1)
    }
    try {
      // 验证
      const _config = await validate(fileConfig)
      // 判断是否是单项目模式
      config._isSingle = !(config.projects && config.projects.length)
      // 合并默认配置
      config = Object.assign({}, defaultConfig, _config)
    } catch (err) {
      error('配置文件错误')
      console.error(err)
      process.exit(-1)
    }
  } else {
    if (args.c) {
      error('配置文件不存在')
      process.exit(-1)
    }
  }
  return {
    config,
    configuration: generateConfig(config, service === 'build' ? 'production' : 'development')
  }
}

function logStats(stats: Stats): void {
  process.stdout.write(
    stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      entrypoints: false
    }) + '\n\n'
  )
}

function webpackHandler(err: Error, stats: any, isProd: boolean = true) {
  if (err) {
    throw err
  }
  if (Array.isArray(stats.stats)) {
    stats.stats.forEach((_stats: Stats) => {
      logStats(<Stats>_stats)
    })
  } else {
    logStats(stats.stats)
  }
  if (stats.hasErrors()) {
    if (isProd) {
      error('构建发生错误')
      process.exit(-1)
    }
    return
  }
  console.log(chalk.cyan('  Build complete.\n'))
}

function devWebpackHandler(err: Error, stats: any) {
  return webpackHandler(err, stats, false)
}

export default async function run(_args: string[]) {
  const { service, args } = parseArg(_args)
  const { config, configuration } = await loadConfiguration(args, service)
  if (service === 'inspect') {
    return console.log(configuration)
  }
  const compiler: MultiCompiler = webpack(configuration)
  if (service === 'build') {
    compiler.run(webpackHandler)
  } else if (service === 'serve') {
    compiler.watch(
      {
        aggregateTimeout: 300,
        poll: undefined
      },
      devWebpackHandler
    )
  } else if (service === 'upload') {
    upload(config, args)
  }
}
