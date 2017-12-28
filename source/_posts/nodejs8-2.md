title: NodeJS 8新特性(2)
date: 2017-06-30 16:22:15
categories: 前端
tags: [Node, JavaScript]
---
继续整理，这次写的都是我觉得在新特性里面比较实用的，最有用的应该算是ASYNC_HOOKS和promisify了。
<!--more-->

## ASYNC_HOOKS

<p><small>async_hooks模块提供了一个API来回溯跟踪Node.js应用创建的异步资源的生命周期。API预览如下：</small></p>
 
```javascript
const async_hooks = require('async_hooks');

// 当前异步资源唯一id
const cid = async_hooks.currentId();

// 触发当前异步行为的异步资源id
const tid = async_hooks.triggerId();

//创建异步勾子监听
const asyncHook = async_hooks.createHook({ init, before, after, destroy });

//开始监听
asyncHook.enable();

//结束监听
asyncHook.disable();

// 资源对象初始化
function init(asyncId, type, triggerId, resource) { }

// 异步回调开始之前
function before(asyncId) { }

// 异步回调完成之后
function after(asyncId) { }

// AsyncWrap实例销毁.
function destroy(asyncId) { }
```
Note: 
init()异步资源生成时执行，用于初始化，这个函数执行的时候异步资源可能还没有完全生成，但是一定会生成一个唯一的asyncID，before()异步回调开始之前执行，它可能被执行0-N次(e.g. TCPWrap)，取决于这个异步资源执行了多少次回调，after()在异步回调finish的时候执行，destroy is called when an AsyncWrap instance is destroyed.


init(asyncId, type, triggerId, resource)

- asyncId &lt;number&gt; 当前异步资源的唯一标识
- type &lt;string&gt; 异步资源的类型
- triggerId &lt;number&gt; 触发当前异步行为的异步资源的asyncId
- resource &lt;Object&gt; 异步资源对象，将在destory时释放，但是并不意味着每个实例都要在destroy之前执行before和after
Note: 
asyncId当前异步资源的唯一标识，type异步资源的类型，triggerId触发当前异步行为的异步资源的asyncId，resource异步资源对象，将在destory时释放，但是并不意味着每个实例都要在destroy之前执行before和after。


type:

FSEVENTWRAP, FSREQWRAP, GETADDRINFOREQWRAP, GETNAMEINFOREQWRAP, HTTPPARSER,
JSSTREAM, PIPECONNECTWRAP, PIPEWRAP, PROCESSWRAP, QUERYWRAP, SHUTDOWNWRAP,
SIGNALWRAP, STATWATCHER, TCPCONNECTWRAP, TCPWRAP, TIMERWRAP, TTYWRAP,
UDPSENDWRAP, UDPWRAP, WRITEWRAP, ZLIB, SSLCONNECTION, PBKDF2REQUEST,
RANDOMBYTESREQUEST, TLSWRAP


trigger_id:

```javascript
async_hooks.createHook({
  init(asyncId, type, triggerId) {
    const cId = async_hooks.currentId();
    fs.writeSync(
      1, `${type}(${asyncId}): trigger: ${triggerId} scope: ${cId}\n`);
  }
}).enable();

require('net').createServer((conn) => {}).listen(8080);
```

## UTIL

<div style="text-align: left;">util.inspect添加[Array]符号, 同时可以展示symbol key</div>

```sh
> const obj = util.inspect({'a': {'b': ['c']}}, false, 1)
> obj
'{ a: { b: [Object] } }'
> assert.strictEqual(obj, '{ a: { b: [Array] } }')
AssertionError: '{ a: { b: [Object] } }' === '{ a: { b: [Array] } }'

// 8.0.0
> obj
'{ a: { b: [Array] } }'
> assert.strictEqual(obj, '{ a: { b: [Array] } }')
undefined
```


<div style="text-align: left;">util.format新增整形——%i，浮点型——%f</div>

```sh
> util.format('%d', 42.2)
'42.2'
> util.format('%i', 42.2)
'%i 42.2'
> util.format('%f', 42.2)
'%f 42.2'

// 8.0.0
> util.format('%d', 42.2)
'42.2'
> util.format('%i', 42.2)
'42'
> util.format('%f', 42.2)
'42.2'
```


- 添加 promisify()

Node.js 一直以来的关键设计就是把用户关在一个“异步编程的监狱”里，以换取非阻塞 I/O 的高性能，让用户轻易开发出高度可扩展的网络服务器。这从 Node.js 的 API 设计上就可见一斑，很多API——如 fs.open(path, flags[, mode], callback)——要求用户必须把该操作执行成功后的逻辑放在最后参数里，作为函数传递进去；而 fs.open 本身是立即返回的，用户不能把依赖于 fs.open 结果的逻辑与 fs.open 本身线性地串联起来。为了减轻异步编程的痛苦，几年间我们见证了数个解决方案的出现：从深度嵌套的回调金字塔，到带有长长的 then() 链条的 Promise 设计模式，再到 Generator 函数，到如今 Node.js 8 的 async/await 操作符。笔者认为，所有这些解决方案中，async/await 操作符是最接近命令式编程风格的，使用起来最为自然的。


```js
const writeFile = require('fs').writeFile;
const stat = require('fs').stat;

await writeFile('a_new_file.txt', 'hello');
let result = await stat('a_new_file.txt');
console.log(result.size);
```
例如我们想先创建一个文件，再读取、输出它的大小，只需三行代码,这简直是最简单的异步编程了！我们用自然、流畅的代码表达了线性业务逻辑，同时还得到了 Node.js 非阻塞 I/O 带来的高性能，简直是兼得了鱼和熊掌。
但别着急，这段代码不是立即就可以执行的，细心的读者肯定会问：例子中的 writeFile 和 stat 分别是什么？其实它们就是标准库的 fs.writeFile 和 fs.stat，但又不完全是。这是因为 async 和 await 本质上是对 Promise 设计模式的封装，一般情况下 await 的参数应是一个返回 Promise 对象的函数。而 fs.writeFile 和 fs.stat 这些标准库 API 没有返回值（返回 undefined），需要一个方法把他们包装成返回 Promise 对象的函数。


```js
const util = require('util');
const fs = require('fs');
const writeFile = util.promisify(fs.writeFile);
const stat = util.promisify(fs.stat);

(async function () {
  await writeFile('a_new_file.txt', 'hello');
  let result = await stat('a_new_file.txt');
  console.log(result.size);
})();
```

## WHATWG URL

nodejs现在完美支持标准URL对象：

```js
const url = require('url');
const URL = url.URL;
// or const { URL } = require('url');
const myURL =
  new URL('https://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash');
myURL;
```


![url](/images/nodejs8/url.png)

Note:url 模块提供了一些实用函数，用于 URL 处理与解析。 可以通过以下方式使用：const url = require('url');
一个 URL 字符串是一个结构化的字符串，它包含多个有意义的组成部分。 当被解析时，会返回一个 URL 对象，它包含每个组成部分作为属性。


Class: URLSearchParams

```js
const { URLSearchParams } = require('url');
```
- urlSearchParams.get(name)
- urlSearchParams.getAll(name)
- urlSearchParams.set(name, value)
- urlSearchParams.append(name, value)
- urlSearchParams.delete(name)
- urlSearchParams.entries()
- urlSearchParams.forEach(fn[, thisArg])
- urlSearchParams.has(name)
- urlSearchParams.sort()
Note: 还有urlSearchParams.values()，urlSearchParams.toString()

## INSPECTOR

命令行在 --inspector基础上，新增--inspector-brk，同时可以添加=[port]指定调试端口，默认9229，node --debug废弃

--debug-brk 通过这个参数，在开始调试的时候能够定位到代码的第一行。


新增inspector内置模块，支持程序化的debug。

```js
const inspector = require('inspector');
```
- inspector.open([port[, host[, wait]]])
- inspector.close()
- inspector.url()
- Class: inspector.Session

如果wait为true，将阻塞，直到客户端连接到检查端口。
If wait is true, will block until a client has connected to the inspect port and flow control has been passed to the debugger client.


```js
const inspector = require('inspector');

const session = new inspector.Session();
session.connect();

// Listen for inspector events
session.on('inspectorNotification', (message) => { /** ... **/ });

// Send messages to the inspector
session.post(message);

session.disconnect();
```
Session这个class支持监听inspector的一些相关事件，可以向v8的inspector后台发送或接收message

## 参考链接

- [npm5 新版功能特性解析及与 yarn 评测对比](https://cloud.tencent.com/community/article/171211?utm_source=tuicool&utm_medium=referral)
- [V8 Ignition：JS 引擎与字节码的不解之缘](https://cnodejs.org/topic/59084a9cbbaf2f3f569be482)
- [https://v8project.blogspot.co.id/2017/04/v8-release-59.html](https://v8project.blogspot.co.id/2017/04/v8-release-59.html)
- [从暴力到 NAN 到 NAPI——Node.js 原生模块开发方式变迁](http://gitbook.cn/m/mazi/article/593763494ec5fa29296acea0?readArticle=yes)
- [WebAssembly](http://huziketang.com/blog/posts/detail?postId=58ce8036a6d8a07e449fdd27)
- [Node8 changes](https://nodejs.org/en/blog/release/v8.0.0)