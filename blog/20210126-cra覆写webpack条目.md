---
slug: 20210203
title: 覆写cra中webpack条目
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [webpack, js]
---

## webpack 存入 electron 打包依赖

部分包内容来自 electron(main)依赖, 不在项目依赖包内

`addWebpackExternals(["electron-store", "request"]),`

## 增加装饰器

`addDecoratorsLegacy()`,

<!--truncate-->

## 加载 worker.js

```js
  // for web worker
  addWebpackModuleRule({
    test: /\.worker\.(js|ts)$/,
    loader: "worker-loader",
    options: {
      chunkFilename: "[name]:[hash:8].js",
    },
  }),
```

## 增加基础样式参数

```js
adjustStyleLoaders((rule) => {
  if (rule.test.toString().includes("scss")) {
    rule.use.push({
      loader: require.resolve("sass-resources-loader"),
      options: {
        resources: "./src/assets/css/param.scss",
      },
    });
  }
});
```

## 其他 config 直接覆写

```js
module.exports = override((config) => {
  //解决Critical dependency: require function is used in a way in which dependencies cannot be statically extracted的问题
  config.module.unknownContextCritical = false;
  return config;
});
```

## 附录:webpack loaders

- css-loader: 直接在 tsx 中 import css 文件
- ts-loader: 转义
- scss-loader:编译 scss
- ...

留意: loader 链式调用的处理顺序是逆序的
`cheese.loader1().loader2().loader3()`
`loader3执行=>loader2执行=>loader1执行`

最后 loader1 的结果被返回
