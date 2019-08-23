import minimist, { ParsedArgs } from 'minimist'
import path from 'path'
import { existsSync } from 'fs'
import { error, warn } from './utils'
import generateConfig from './webpack'
import { validate, FileConfig } from './config'
import webpack, { Configuration, MultiCompiler, Stats } from 'webpack'

const usageString = `usage:
mwxpack serve [-c mwxpack.config.js]
mwxpack build [-c mwxpack.config.js]
mwxpack inspect [-c mwxpack.config.js] > config.js`

const services = ['serve', 'build', 'inspect']

export function parseArg (_args: string[]): { service: string, args: ParsedArgs} {
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

export async function loadConfiguration (args: ParsedArgs, service: string): Promise<Configuration[]> {
  // 配置
  let config: FileConfig | null = null
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
      config = await validate(fileConfig)
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
  return generateConfig(config, service === 'build' ? 'production' : 'development')
}

function webpackHandler (err: Error, stats: Stats) {
  if (err) {
    throw err
  }
  if (stats.hasErrors()) {
    error('构建发生错误')
    process.exit(-1)
  }
  console.log(stats.toString({
    colors: true,
    chunks: false,
    children: false,
    modules: false
  }))
}

export default async function run (_args: string[]) {
  const { service, args } = parseArg(_args)
  const webpackConfiguration = await loadConfiguration(args, service)
  if (service === 'inspect') {
    return console.log(webpackConfiguration)
  }
  const compiler: MultiCompiler = webpack(webpackConfiguration)
  if (service === 'build') {
    compiler.run(webpackHandler)
  } else {
    compiler.watch({
      aggregateTimeout: 300,
      poll: undefined
    }, webpackHandler)
  }
}
