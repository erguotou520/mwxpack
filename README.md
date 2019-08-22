# 微信小程序开发/打包

## 用法
先在项目根目录创建`mwxpack.config.js`，内容如下：

```js
// const path = require('path')
module.exports = {
  // 源码目录位置
  srcDir: './src',
  // 打包后的目录位置
  outputDir: './dist',
  // 每个项目需要复制的目录
  copyDirs: 'public',
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
```
