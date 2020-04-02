import path from 'path'
import Joi from '@hapi/joi'
import { Configuration } from 'webpack'

// const currentDir = process.cwd()

const ConfigSchema = Joi.object().keys({
  // 是否使用package.json中的description字段作为本次上传的说明
  useDescription: Joi.bool(),
  mode: Joi.string().allow(['development', 'production', 'none']),
  projects: Joi.array().items(Joi.string().required()),
  srcDir: Joi.string(),
  outputDir: Joi.string(),
  copyDirs: [Joi.string(), Joi.array().items(Joi.string().required())],
  webpackConfiguration: [Joi.object(), Joi.func()]
})

export interface FileConfig {
  useDescription?: boolean
  mode?: 'development' | 'production' | 'none'
  // 所属平台
  platform?: 'wx' | 'ali' | 'swan' | 'qq' | 'tt'
  projects: string[]
  // 是否是单项目模式，如果projects传了，那么认为是多项目模式，否则是单项目
  _isSingle: boolean
  srcDir: string
  outputDir: string
  copyDirs?: string[]
  webpackConfiguration: Configuration | Function
}

export const defaultConfig: FileConfig = {
  srcDir: 'src',
  _isSingle: true,
  projects: [''],
  outputDir: 'dist',
  copyDirs: ['static'],
  webpackConfiguration: {}
}

export async function validate(config: Configuration): Promise<FileConfig> {
  return new Promise((resolve, reject) => {
    Joi.validate(config, ConfigSchema, (e, value) => {
      if (e) {
        reject(e)
      } else {
        resolve(<FileConfig>value)
      }
    })
  })
}
