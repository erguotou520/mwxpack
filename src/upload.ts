import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { spawn } from 'child_process'
import { ParsedArgs } from 'minimist'
import { FileConfig } from './config'
import { log, debug } from './utils'

interface UploadArgs {
  projectPath: string
  version: string
  description?: string
  output?: string
}

const currentDir = process.cwd()

let cliPath: string
let pwd: string

// 获取命令行位置
export async function getCliPath() {
  if (!['win32', 'darwin'].includes(process.platform)) {
    throw new Error('不支持的操作系统')
  }
  // 默认路径
  cliPath =
    process.platform === 'darwin'
      ? `/Applications/wechatwebdevtools.app`
      : `C:\\Program Files (x86)\\Tencent\\微信web开发者工具`
  // 环境变量覆盖
  const envCliPath = process.env.WECHAT_MINAPP_DEVTOOL_PATH
  if (envCliPath) {
    cliPath = envCliPath
  }
  if (process.platform === 'darwin') {
    pwd = path.resolve(cliPath, 'Contents/MacOS')
    cliPath = path.resolve(pwd, 'cli')
  } else if (process.platform === 'win32') {
    pwd = cliPath
    cliPath = path.resolve(pwd, 'cli.bat')
  }
  try {
    if (!(await promisify(fs.exists)(cliPath))) {
      throw new Error('命令行工具路径似乎不正确')
    }
  } catch (error) {
    // do nothing
    throw new Error('命令行工具路径似乎不正确')
  }
  return {
    cliPath,
    pwd
  }
}

// 执行上传任务
export async function doUpload(args: UploadArgs) {
  if (!cliPath) {
    await getCliPath()
  }
  if (!args.projectPath) throw new Error('未设置项目路径')
  if (!args.version) throw new Error('版本号必须')
  const spawnArgs = ['-u', `${args.version}@${args.projectPath}`]
  if (args.description) {
    spawnArgs.push(...[`--upload-desc`, args.description])
  }
  if (args.output) {
    spawnArgs.push(...['--upload-info-output', args.output])
  }
  debug(`${cliPath} ${spawnArgs.join(' ')}`)
  log(`正在上传${args.version}版本`)
  return new Promise((resolve, reject) => {
    const child = spawn(cliPath, spawnArgs, {
      cwd: pwd,
      stdio: 'inherit'
    })

    child.on('close', code => {
      if (code) {
        reject(code)
      } else resolve()
    })
  })
}

// 获取指定路径下的package.json文件内容
async function getPkgInfo(folder: string) {
  const packageJsonFile = path.resolve(folder, 'package.json')
  try {
    if (await promisify(fs.exists)(packageJsonFile)) {
      const pkg = require(packageJsonFile)
      return pkg
    }
  } catch (error) {}
}

// 根据配置和环境变量取执行上传
export default async function upload(config: FileConfig, args: ParsedArgs) {
  // 每个项目单独上传
  for (const project of config.projects || []) {
    // 项目路径
    const projectPath = path.resolve(currentDir, config.outputDir, project)
    // 获取版本号，版本描述，和上传后的结果输出目录
    // 优先从命令行参数中读取
    let version: string = args.v
    let description: string = args.d
    let output: string = args.o
    // 读取不到则去读取package.json文件
    if (!version || !description) {
      const pkg = await getPkgInfo(projectPath)
      if (pkg) {
        // 版本号
        if (!version && pkg.version) {
          version = pkg.version
        }
        // 版本描述
        if (config.useDescription && !description && pkg.description) {
          description = pkg.description
        }
      }
      // 如果仍然找不到version，则尝试去项目跟目录读取
      if (!version) {
        const rootPkg = await getPkgInfo(process.cwd())
        if (rootPkg) {
          version = rootPkg.version
        }
      }
    }
    try {
      await doUpload({
        projectPath,
        version,
        description,
        output
      })
    } catch (error) {
      console.error(error)
    }
  }
}
