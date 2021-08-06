---
slug: 202100803
title: Chrome extension As a tool
author: Yao
author_title: senior developer
author_url: https://github.com/caperso
author_image_url: https://avatars.githubusercontent.com/u/34877623?s=400&u=8da3f1b8199cdbd5591ea229149fa663f2011065&v=4
tags: [chrome]
---

## chrome extension 是啥

[Official doc]<https://developer.chrome.com/docs/extensions/>

### 能做些什么?

1. 做工具、小插件、widgets
2. 做一些 bot

### 使用示例

仅限**开发者模式**, 没有必要发布

1. Clone this repository
2. Open `chrome://extensions/` url in your Chrome browser
3. Turn on the `Developer mode`
4. Click `Load unpacked` button
5. Navigate to the folder with the extension
6. Press select

这里推荐, 加载整个 repo, 这样, branch 可以作为新的开发 feature, 可以拉取新的 branches 来体验各特性.

<!-- truncate -->

## 开发

### 扩展入口声明

根目录必须要有 manifest.json 声明文件

```json manifest.json
{
  "name": "DancingBot",
  "version": "1.0",
  "description": "A dancing bot",
  "background": {
    "scripts": ["scripts/background.js"],
    "persistent": false
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["scripts/content_script.js"],
      "all_frames": true
    }
  ],
  "page_action": {
    "default_popup": "ui/index.html", // 在此挂载界面
    "default_icon": {
      "16": "images/16.png" // "32 64 128"
    }
  },
  "icons": {
    "16": "images/16.png" // "32 64 128"
  },
  "permissions": ["activeTab", "contextMenus", "declarativeContent", "storage"], // 权限
  "manifest_version": 2 // !
}
```

**manifest_version**

这其中 manifest_version - mv 是控制 chrome extension 适应的接口版本的重要参数, 2020 更新第三版, 有很多安全和性能提升.

例如加入了对 service workers 和 promises 的支持

<https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/>

而且文档也提到了 mv 会逐步要求升级, V1 已被弃用, V2 在未来也会被弃用

V3 最低要求是 chrome 88

### 基础

1. js. 可加入 jq, lodash 库等工具库

2. html, css 如果需要界面化

3. chrome-extension-api:<https://developer.chrome.com/docs/extensions/reference/>

### chrome 对象

直接可以访问的`window.chrome`/`window.chrome.runtime`

典型的 API:

chrome.runtime.onInstalled - 此钩子在挂载 extension 之后进行触发,可在此挂入监听

`chrome.runtime.onInstalled.addListener()`

### demo: 自动表单填写

有份表单

<https://codesandbox.io/s/wizardly-hopper-c3x78?file=/index.html>

制作一个能填写表单内容的 bot
**手动填写**

1. 声明一个文档 background.js

```json
  "background": {
    "service_worker": "background.js"
  },
```

在 background.service_worker 中添加该脚本,
这是扩展服务的入口, 对浏览器行为监听的地点.

通过 chromeAPI 构建一个简单的服务.

`chrome.declarativeContent`
可根据页面内容执行操作，而无需获得读取页面内容的权限。

在此, 我们要定一个规则

```js
const rule = {
  condition: [
    new chrome.declarativeContent.PageStateMatcher({
      pageUrl: { hostContains: "*" },
    }),
  ],
  action: [new chrome.declarativeContent.showPageAction()],
};
```

> 注: 应该始终批量注册或取消注册规则，而不是单独注册或取消注册。

> 注: chrome 93 之前, service-worker 必须必须在项目根目录才能挂载, manifest 同级.

1. 简单写个 button 的 ui

```json
  "action": {
    "default_popup": "ui/index.html"
  }
```

在此引入 script
`<script src="./index.js"></script>`

> 我并不想在每个页面加载我的插件

**自动填写**
不自动填写怎么能叫 bot 呢

## 发布

-
