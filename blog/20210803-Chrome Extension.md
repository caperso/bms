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

基础的:

1. 做工具、小插件、widgets
2. 做一些 bot

控制能力:

1. 书签控制；
2. 自动操作(Tampermonkey)
3. 下载控制；
4. 标签/窗口控制；
5. 网页事件监听；
6. 页面注入(Adblock);

### 使用示例

对于我们内部开发, 没有必要发布

可在**开发者模式**中加载目标目录(必有入口文件 manifest.json)

1. Clone this repository
2. Open `chrome://extensions/` url in your Chrome browser
3. Turn on the `Developer mode`
4. Click `Load unpacked` button
5. Navigate to the folder with the extension
6. Press select

这里推荐, 加载整个 repo, 这样, branch 可以作为新的开发 feature, 可以拉取新的 branches 来体验各特性.

<!-- truncate -->

## 开发

### 基本技能需求

1. js.

   - 可加入 jq, lodash 库等工具库 (react 等库则需要编译产物)

2. html, css

   - (如果需要界面化)

3. chrome-extension-api:<https://developer.chrome.com/docs/extensions/reference/>

### 开发入口

manifest.json 声明文件

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

manifest_version , decides to connect which version of the extension Api,

it's important because it's like a major version changes, news will be added and deprecated ones would drop

in 2020 , it comes to the version 3, bringing the security updates.

like replacing the background with service workers, full promises supports

<https://developer.chrome.com/docs/extensions/mv3/intro/mv3-overview/>

Google also gives a timeline of live time v2

https://developer.chrome.com/docs/extensions/mv3/mv2-sunset/

> By January 2023 v2 Chrome stops running Manifest V2 extensions

Of course, v2 still the most popular one.

Chrome 88 is the first one supports V3

## 调试



在**开发者模式**中加载目标目录

- 必有入口文件 manifest.json

1. 输入 url `chrome://extensions/`
2. 开启开发者模式 `Developer mode`
3. 加载本地已有 repo 目录位置 `Load unpacked` 按钮
4. 在扩展列表找到这个扩展, 点击卡片上的 log, `background page (service worker)`
5. 页面调试可直接在`source panel` 中的`content scripts`上找到,
6. 然后进行断点调试

> 调试窗口/调试用的页面, 在 reload extension 后,需要重新加载才能生效

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

#### 实现 3: 自动填写

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

## Refs

<https://juejin.cn/post/6986437856348602382>
