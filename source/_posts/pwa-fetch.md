title: PWA：fetch API
date: 2017-09-14 15:27:23
categories: JavaScript
tags: [WebApp,JavaScript]
---

第一次听PWA（Progressive Web App）这个词，还是在刚入职的时候。当时刚入坑前端几个月的我还是一脸萌币的状态，只是有一种不明觉厉的感觉。后来忙来忙去的也就扔在一边了，然后最近看到裕波大大的一篇文章：[震惊！苹果向开发者低头？！！开始支持Service Worker](https://zhuanlan.zhihu.com/p/28293894),之前都是说这东西在国内发展不起来主要是因为国内的果粉太多，而苹果对ServiceWork一直处于冷漠的观望态度- -实际上，好像并没有那么冷漠233333...废话完毕，把最近学到的东西整理下：
<!--more-->
### 打算分三个方面吧：
1. Fetch API
2. Cache API
3. Service Worker

### Fetch API
嗯这里主要讲fetch。其实说到底，fetch API和PWA关系并不是很大(但还是要了解这个东东)，而且Fetch API并不是为了PWA而生的，确切的说，我倒是觉得这货是为了取代Ajax的XMLHttpRequest而生的。先看一下fetch的基本用法（取自[Introduction to the Fetch API](https://www.sitepoint.com/introduction-to-the-fetch-api/)）

```js
/* API URL, you need to supply your API key */
var URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=your_api_key&format=json&nojsoncallback=1&tags=penguins';

function fetchDemo() {
  fetch(URL).then(function(response) {
    return response.json();
  }).then(function(json) {
    insertPhotos(json);
  });
}

fetchDemo();
```

fetch可以接受两个参数，基本语法为:

```
Promise<Response> fetch(input[, init]);
```
第一个参数input可以是一个 [USVString](https://developer.mozilla.org/zh-CN/docs/Web/API/USVString) 字符串，包含要获取资源的 URL，也可以是一个Request对象。第二个参数init是一个可选的配置对象，详见[这里](https://developer.mozilla.org/zh-CN/docs/Web/API/GlobalFetch/fetch)。
返回值是一个Promise对象，resolve结果为该请求对应的Response对象。

### Request && Response
Fetch引入了三个接口：Headers，Request和Response。
上面提到了Request对象和Response对象，这两个对象用来表示Fetch API的资源请求和响应。
你可以使用  Request.Request() 构造函数创建一个 Request 对象，Request对象也可能被其他API返回，比如一个 service worker FetchEvent.request。Request对象接受两个参数，这两个参数和Fetch接受的参数一模一样,其中headers可以通过Headers对象生成。

```js
var headers = new Headers();
headers.append('Accept', 'application/json');
var req = new Request(URL, {
	method: 'GET',
	header: headers, 
	cache: 'reload'
});
fetch(req).then(function(response) {
  return response.json();
}).then(function(json) {
  insertPhotos(json);
});
```
而且，我们可以从一个Request去生成另一个Request，下面的例子通过一个GET类型的Request，使用相同的配置新建了一个POST类型的Request。
```js
var postReq = new Request(req, {method: 'POST'});
```

同样的，我们可以使用Response的构造器建立一个Response对象：

```js
var myResponse = new Response();
```
Response对象的相关属性可以参考[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Response)。
尽管如此，我们实际上使用的Response对象大多都是其他API返回的，比如Fetch API，之前也说过，Fetch API返回的promise对象resolve的结果就是一个Response对象。

### Body
Request和Response对象都实现了[Body](https://developer.mozilla.org/zh-CN/docs/Web/API/Body)对象的方法。
body可以是以下类型的实例：
- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [ArrayBufferView](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView)
- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [File](https://developer.mozilla.org/en-US/docs/Web/API/File)
- String
- [URLSearchParams](https://url.spec.whatwg.org/#interface-urlsearchparams)
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

Request和Response都为他们的body提供了以下方法，这些方法都返回一个Promise对象：
- arrayBuffer()
- blob()
- json()
- text()
- formData()

### WHY FETCH？
使用XHR发起一个请求一般是这样： 

```js
var xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.responseType = 'json';

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.onerror = function() {
  console.log("error");
};

xhr.send();
```
而使用fetch：

```js
fetch(url).then(function(response) {
  return response.json();
}).then(function(data) {
  console.log(data);
}).catch(function(e) {
  console.log("error");
});
```
即使我们现在有jquery等类库对ajax进行了完美的封装，但xhr终归是一个设计较为粗糙的API，配置和调用起来并不是那么友好，而且基于事件的异步模型写起来也没有现代的Promise，而Request和Response对象遵循HTTP协议规范设计，而且基于Promise实现，配合现在的箭头函数，async/await可以更好地表现。在使用非文本方面，Body提供的相应方法使得Fetch API和XHR相比提供了极大的便利。
这里可能有人会有个疑问：Response就应该是请求来返回的，我们在浏览器端制造Response对象有什么意义？Service Workers API会告诉你答案。

### 一些常见的坑

1. 首先，Fetch API发起的请求默认是不带cookie的，如果需要携带cookie请设置 fetch(url, {credentials: 'include'})。
2. 服务器返回 400，500 错误码时并不会 reject，仅仅是Response的ok字段变为false，只有网络错误这些导致请求不能完成时，fetch 才会被 reject。
3. 关于跨域，Fetch的第二个参数对象有一个 mode 属性，mode 属性用来决定是否允许跨域请求，以及哪些response属性可读。可选的mode属性值为 same-origin ， no-cors （默认）以及 cors 。
- same-origin 模式很简单，如果一个请求是跨域的，那么返回一个简单的error，这样确保所有的请求遵守同源策略。
- no-cors 模式允许来自CDN的脚本、其他域的图片和其他一些跨域资源，但是首先有个前提条件，就是请求的method只能是"HEAD","GET"或者"POST"。此外，任何 ServiceWorkers 拦截了这些请求，它不能随意添加或者改写任何headers，除了[这些](https://fetch.spec.whatwg.org/#simple-header) 。JavaScript不能访问Response中的任何属性，这保证了 ServiceWorkers 不会导致任何跨域下的安全问题而隐私信息泄漏。
- cors 模式我们通常用作跨域请求来从第三方提供的API获取数据。这个模式遵守 [CORS协议](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) 。