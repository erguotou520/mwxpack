# 微信小程序开发/打包

## 用法

在项目根目录创建`mwxpack.config.js`，内容如下：

```js
// const path = require('path')
module.exports = {
  // 源码目录位置
  srcDir: './src',
  // 打包后的目录位置
  outputDir: './dist',
  // 每个项目需要复制的目录，默认复制每个项目下的static目录，如果是单项目则复制根目录下的static目录
  copyDirs: ['public'],
  // 项目列表，相对于srcDir
  projects: [
    'projectA',
    'projectB',
    'projectC'
  ],
  webpackConfiguration: {
    // 用于覆盖的webpack设置
    ...
  },
  // or
  // webpackConfiguration: (project) => {
  //   return {
  //     ...
  //   }
  // }
}
```

然后命令行执行：

```bash
# 开发时
mwxpack server

# 打包
mwxpack build

# 发布，使用小程序开发者工具的命令行方式进行上传
# 目前只支持windows和mac系统，默认会从mac的 /Applications/wechatwebdevtools.app 目录和windows的 C:\\Program Files (x86)\\Tencent\\微信web开发者工具 目录读取
# 如果安装的开发者工具目录不是默认目录，请通过环境变量WECHAT_MINAPP_DEVTOOL_PATH变量设置
# 上传时默认会查找每个项目下的package.json中的version作为上传的版本号，如果没找到会尝试在项目跟目录下查找，但是也可以通过参数 -v xxx进行覆盖
# 上传描述可以通过设置mwxpack.config.js中的useDescription来决定是否使用package.json中的description字段作为版本说明
# 参数-o可以将上传的信息输出到指定路径
mwxpack deploy [-v 1.0.0] [-d description] [-o /path/to/output]
```

## 环境变量

- MPX_ENABLE 是否开启 mpx 支持，默认 true
- WECHAT_MINAPP_DEVTOOL_PATH 自定义微信开发者工具的安装目录
- npm_config_report 是否开启构建报告，可以通过--report 传递
