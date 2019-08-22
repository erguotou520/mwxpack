import Joi from '@hapi/joi'
import { Configuration } from 'webpack'

const ConfigSchema = Joi.object().keys({
  projects: [
    Joi.string().required(),
    Joi.array().items(
      Joi.string().required()
    ).required()
  ],
  srcDir: Joi.string(),
  outputDir: Joi.string(),
  copyDirs: [
    Joi.string(),
    Joi.array().items(Joi.string().required()),
  ],
  webpackConfiguration: [
    Joi.object(),
    Joi.func()
  ]
})

export interface FileConfig {
  projects: string[] | string
  srcDir?: string
  outputDir?: string
  copyDirs?: string[]
  webpackConfiguration: Configuration | Function
}

export async function validate (config: Configuration): Promise<FileConfig> {
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
