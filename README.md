# 使用说明

该案例是 react 服务器渲染案例，简称 React SSR，采用 create-react-app 构建项目。

1. **npm install** 安装依赖

2. **npm run build** 打包项目

3. **npm run server** 启动服务器，访问地址 _http://localhost:3030_ 访问项目

# 前言

本文是基于 react ssr 的入门教程，在实际项目中使用还需要做更多的配置和优化，比较适合第一次尝试 react ssr 的小伙伴们。技术涉及到 koa2 + react，案例使用 create-react-app 创建

# SSR 介绍

Server Slide Rendering，缩写为 **ssr** 即服务器端渲染，这个要从 SEO 说起，目前 react 单页应用 HTML 代码是下面这样的

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="favicon.ico" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="theme-color" content="#000000" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script src="/js/main.js"></script>
  </body>
</html>
```

1. 如果 main.js 加载比较慢，会出现白屏一闪的现象。
2. 传统的搜索引擎爬虫因为不能抓取 JS 生成后的内容，遇到单页 web 项目，抓取到的内容啥也没有。在 SEO 上会吃很多亏，很难排搜索引擎到前面去。
   React SSR（react 服务器渲染）正好解决了这 2 个问题。

# React SSR 介绍

这里通过一个例子来带大家入坑！先使用 create-react-app 创建一个 react 项目。因为要修改 webpack，这里我们使用 react-app-rewired 启动项目。根目录创建一个 server 目录存放服务端代码，服务端代码我们这里使用 koa2。目录结构如下：

![图片描述][1]

这里先来看看 react ssr 是怎么工作的。

![图片描述][2]

这个业务流程图比较清晰了，服务端只生成 HTML 代码，实际上前端会生成一份 main.js 提供给服务端的 HTML 使用。这就是 react ssr 的工作流程。有了这个图会更好的理解，如果这个业务没理解清楚，后面的估计很难理解。

> react 提供的 SSR 方法有两个 renderToString 和 renderToStaticMarkup，区别如下：

- renderToString 方法渲染的时候带有 data-reactid 属性. 在浏览器访问页面的时候，main.js 能识别到 HTML 的内容，不会执行 React.createElement 二次创建 DOM。
- renderToStaticMarkup 则没有 data-reactid 属性，页面看上去干净点。在浏览器访问页面的时候，main.js 不能识别到 HTML 内容，会执行 main.js 里面的 React.createElement 方法重新创建 DOM。

# 实现流程

好了，我们都知道原理了，可以开始 coding 了,目录结构如下：

![图片描述][3]

create-react-app 的 demo 我没动过，直接用这个做案例了，前端项目基本上就没改了,等会儿我们服务器端要使用这个模块。代码如下：

```javascript
import "./App.css";

import React, { Component } from "react";

import logo from "./logo.svg";

class App extends Component {
  componentDidMount() {
    console.log("哈哈哈~ 服务器渲染成功了！");
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
```

在项目中新建 server 目录，用于存放服务端代码。为了简化，我这里只有 2 个文件，项目中我们用的 ES6，所以还要配置下.babelrc

![图片描述][4]

> .babelrc 配置，因为要使用到 ES6

```json
{
  "presets": ["env", "react"],
  "plugins": [
    "transform-decorators-legacy",
    "transform-runtime",
    "react-hot-loader/babel",
    "add-module-exports",
    "transform-object-rest-spread",
    "transform-class-properties",
    [
      "import",
      {
        "libraryName": "antd",
        "style": true
      }
    ]
  ]
}
```

> index.js 项目入口做一些预处理，使用 asset-require-hook 过滤掉一些类似 `import logo from "./logo.svg";` 这样的资源代码。因为我们服务端只需要纯的 HTML 代码，不过滤掉会报错。这里的 name，我们是去掉了 hash 值的

```javascript
require("asset-require-hook")({
  extensions: ["svg", "css", "less", "jpg", "png", "gif"],
  name: "/static/media/[name].[ext]",
});
require("babel-core/register")();
require("babel-polyfill");
require("./app");
```

> public/index.html html 模版代码要做个调整，`{{root}}` 这个可以是任何可以替换的字符串，等下服务端会替换这段字符串。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <meta name="theme-color" content="#000000" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">{{root}}</div>
  </body>
</html>
```

> app.js 服务端渲染的主要代码，加载 App.js，使用 renderToString 生成 html 代码，去替换掉 index.html 中的 `{{root}}` 部分

```javascript
import App from "../src/App";
import Koa from "koa";
import React from "react";
import Router from "koa-router";
import fs from "fs";
import koaStatic from "koa-static";
import path from "path";
import { renderToString } from "react-dom/server";

// 配置文件
const config = {
  port: 3030,
};

// 实例化 koa
const app = new Koa();

// 静态资源
app.use(
  koaStatic(path.join(__dirname, "../build"), {
    maxage: 365 * 24 * 60 * 1000,
    index: "root",
    // 这里配置不要写成'index'就可以了，因为在访问localhost:3030时，不能让服务默认去加载index.html文件，这里很容易掉进坑。
  })
);

// 设置路由
app.use(
  new Router()
    .get("*", async (ctx, next) => {
      ctx.response.type = "html"; //指定content type
      let shtml = "";
      await new Promise((resolve, reject) => {
        fs.readFile(
          path.join(__dirname, "../build/index.html"),
          "utf8",
          function (err, data) {
            if (err) {
              reject();
              return console.log(err);
            }
            shtml = data;
            resolve();
          }
        );
      });
      // 替换掉 {{root}} 为我们生成后的HTML
      ctx.response.body = shtml.replace("{{root}}", renderToString(<App />));
    })
    .routes()
);

app.listen(config.port, function () {
  console.log("服务器启动，监听 port： " + config.port + "  running~");
});
```

> config-overrides.js 因为我们用的是 create-react-app，这里使用 react-app-rewired 去改下 webpack 的配置。因为执行**npm run build**的时候会自动给资源加了 hash 值，而这个 hash 值，我们在 asset-require-hook 的时候去掉了 hash 值，配置里面需要改下，不然会出现图片不显示的问题，这里也是一个坑，要注意下。

```javascript
module.exports = {
  webpack: function (config, env) {
    // ...add your webpack config
    // console.log(JSON.stringify(config));
    // 去掉hash值，解决asset-require-hook资源问题
    config.module.rules.forEach((d) => {
      d.oneOf &&
        d.oneOf.forEach((e) => {
          if (e && e.options && e.options.name) {
            e.options.name = e.options.name.replace("[hash:8].", "");
          }
        });
    });
    return config;
  },
};
```

好了，所有的代码就这些了，是不是很简单了？我们 koa2 读取的静态资源是 build 目录下面的。先执行**npm run build**打包项目，再执行**node ./server** 启动服务端项目。看下 http://localhost:3030 页面的 HTML 代码检查下：

![图片描述][5]

![图片描述][6]

没有`{{root}}`了，服务器渲染成功！

# 总结

相信这篇文章是最简单的 react 服务器渲染案例了，这里交出 github 地址，如果学会了，记得给个 star

> https://github.com/mtsee/react-koa2-ssr

[1]: https://image-static.segmentfault.com/172/820/1728206619-5c765504b90de_articlex
[2]: https://image-static.segmentfault.com/147/717/1477175201-5c7657d0d7a29_articlex
[3]: https://image-static.segmentfault.com/337/614/3376146941-5c76632940970_articlex
[4]: https://image-static.segmentfault.com/114/696/1146964533-5c765ba08f00b_articlex
[5]: https://image-static.segmentfault.com/117/321/1173215685-5c76616aa0cd0_articlex
[6]: https://image-static.segmentfault.com/714/996/714996020-5c7661032ad25_articlex

# fork 后续（from bill）

后续配置了路由，
需要添加和修改一些配置：
src/index.js

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import \* as serviceWorker from "./serviceWorker";

ReactDOM.hydrate(
<BrowserRouter>
<App />
</BrowserRouter>,
document.getElementById("root")
);

serviceWorker.unregister();

server/app.js

import { StaticRouter} from "react-router-dom";
ctx.response.body = shtml.replace(
"{{root}}",
renderToString(
<StaticRouter>
<App />
</StaticRouter>
)
);

具体的博客说明：http://biaoblog.run/#/bookInfo/1631605948548
