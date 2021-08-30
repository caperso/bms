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
    "service_worker": "./background.js"
  },
  "action": {
    "default_popup": "ui/index.html", // 在此挂载界面
    "default_icon": {
      "16": "images/16.png" // "32 64 128"
    }
  },
  "icons": {
    "16": "images/16.png" // "32 64 128"
  },
  "permissions": ["activeTab", "contextMenus", "declarativeContent", "storage"], // 权限
  "manifest_version": 3 // !
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

> reload extension 后,在测试页面需要重新加载

### chrome 对象

直接可以访问的`window.chrome`/`window.chrome.runtime`

典型的 API:

chrome.scripting - 执行另一份 script.

需要权限: scripting

chrome.runtime.onInstalled - 在挂载 extension 之后进行触发,可在此挂入监听

`chrome.runtime.onInstalled.addListener()`

### demo: 自动表单填写

有份表单

<https://codesandbox.io/s/wizardly-hopper-c3x78?file=/index.html>

现在,制作一个能填写表单内容的 bot

#### 实现 1: 点击 extension 填写表单

1. 声明一个文档 background.js

```json manifest.json
  "background": {
    "service_worker": "background.js"
  },
```

在 background.service_worker 中添加该脚本,
这是也是扩展服务的入口, 通过这个 chromeAPI 构建一个简单的服务.
同时, 需要将权限添加

```json manifest.json
"permissions": [
    "activeTab", // 获取激活的tab
    "tabs", // 获取tabs
    "scripting", // 获取执行脚本的能力
    "contextMenus", // 获取右键事件
    "declarativeContent", // 获取探测页面内容权限 ***  可根据页面内容执行操作，而无需获得读取页面内容的权限。
],
```

在 background.js, 写入主要的填写逻辑

```js background.js
function fillForm() {
  const data = {
    name: "John Doe",
    age: 32,
    address: "Any town",
    country: "Iceland",
    phone: "+1426855510",
  };

  const prefix = "data-form";

  document.querySelector(`[${prefix}-id="name"]`).value = data.name;
  document.querySelector(`[${prefix}-id="age"]`).value = data.age;
  document.querySelector(`[${prefix}-id="address"]`).value = data.address;
  document.querySelector(`[${prefix}-id="country"]`).value = data.country;
  document.querySelector(`[${prefix}-id="phone"]`).value = data.phone;
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: fillForm,
  });
});
```

这样, 点击 extension 的 icon 就可以调用 background 中的内容了.

#### 实现 2: 有 UI, 需要自定选项

##### 在开发代码之前, 插播一条必要了解几个脚本

**content.js**

Chrome 插件向页面注入的脚本.
content-scripts 和 页面共享 DOM.
当然,不共享 JS.

每个 content script 都是独立运行的

> Content scripts live in an isolated world, allowing a content script to make changes to its JavaScript environment without conflicting with the page or other extensions' content scripts.

<https://developer.chrome.com/docs/extensions/mv3/content_scripts/>

**background.js**
也就是现的 service-worker, 他即为扩展的服务,也是扩展的生命周期.
浏览器若启动了扩展,它便会随着浏览器的打开而打开.
在浏览器的关闭时结束.
通常我们需要

**ui/index.js**
这就是扩展 ui 需要的脚本

**注意**

1. 脚本支持 ES6 语法, ~~应该也~~支持最新 ES 语法,这个是和 chrome 自身解释器一样的.
2. content_scripts 无法使用 import, 意味着第三方模块不能静态加载
3. content_script 中,this 指向的是当前 window, 那么也就说明有 BOM 对象, 不是 node 进程,没有 process
4. 在脚本中调用 chrome.extension 即指向了本身扩展对象

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

#### **手动填写** =〉 **自动填写**

不自动填写怎么能叫 bot 呢

## 发布

-

devtools 掉线: reload extension, 权限设置错误

## 其他

1. 我还是想在 content_script 中调用其他脚本
   可行, 参见<https://github.com/otiai10/chrome-extension-es6-import>

   - 通过异步获取扩展的其他脚本并执行

```js content.js
async () => {
  const src = chrome.extension.getURL("src/js/content_sub.js");
};
```

- 在 manifest 中, 声明**对本扩展内**的目录访问支持
  - <https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/>
  - 文档中声明了一点, 这些资源是可以被页面/其他扩展所访问的.

```json manifest.json
"web_accessible_resources": [
  {
    "resources": ["src/js/*"], // '开放的资源(image/脚本...)'
    "extensions": "leenfdecgofgegmmabaciaognmodhemc", // 这是允许访问的extension id
    "matches":[] // 匹配其他页面地址
  }
]
```

可以好好利用此配置来加强其安全性, 部分的恶意操作在文档中也有列举.

