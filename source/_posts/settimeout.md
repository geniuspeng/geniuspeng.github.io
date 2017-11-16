title: 关于一道题想到的...
date: 2017-11-14 15:51:06
categories: JavaScript
tags:
- 闭包 
- IIFE
---

最新偶然看到一个关于for + setTimeout (fn, 0)的问题，其实在面试中，我们也经常被问到关于这类问题，一般涉及到闭包，作用域和作用域链，然后关于setTimeout (fn, 0)的执行顺序，顺便可以带出一些异步执行，任务队列，时间循环的东西，关于这些自己在一年前找工作的时候了解了一些，但是也不是很透彻。当时看的是阮一峰老师的[JavaScript 运行机制详解：再谈Event Loop](http://www.ruanyifeng.com/blog/2014/10/event-loop.html),只是大概知道有这么个东西，但具体来说还是...一脸萌比的状态
<!--more-->
先来看看最开始说的那一道题吧，虽然和主要想写的东西没啥关系...

```js
for (var i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```
嗯就是这么一道题，相信稍微了解js的都能知道输出结果--->在1秒之后连续输出5个5。而且原因简单来说就是setTimeout会延迟执行，等到里面执行的时候，i已经变成5了。嗯这么说倒是一点毛病没有，但是关于这个setTimeout往深了讲，能挖出来的东西就太多了。不过这里就先不挖了，这个时候我们还可能被问到如何修改一下变成输出0到4？？？
这个解决方法也是很多啦~~~不过大多数同学应该想到的就是利用[IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/#iife)增加一个闭包来解决。

```js
for (var i = 0; i < 5; i++) {
  (function(i) {
    setTimeout(function() {
      console.log(i);
    }, 1000);
  })(i);
}
```
或者这样

```js
for (var i = 0; i < 5; i++) { 
   setTimeout( (function(i) {
      return function() {
        console.log(i);
      }
   })(i), 1000);
}
```
原理也不用细说了吧，应该都知道，就是让里面的i就是里面的i，外面的i就是外面的i，如果真的不理解原理可以参考[这个](http://www.jianshu.com/p/9b4a54a98660)。
当然我之前不知道的是，除了这种传统的方法（或者类似的），还发现了很多‘野路子’，比如把上边那段代码去掉两行：

```js
for (var i = 0; i < 5; i++) { 
   setTimeout( (function(i) {
     console.log(i);
   })(i), 1000);
}
```
如果你对js理解很深，完全可以看懂这个套路。理论上setTimeout传入的第一个参数应该是个fn，这里传的是一个IIFE，然而这个函数并没有return值，所以最后的结果就是undefined，所以for里面的实际就是setTimeout(undefined, 1000），当然啦这个没有任何效果，不过里面的东西可是会立即执行的，当然这么写会立即输出而不是延迟1秒。
当然啦还有一些其他的方法咯，比如这这样,使用ES5的bind的方法[bind传送门](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)：

```js
for (var i = 0; i < 5; i++) { 
  setTimeout( function(i) {
    console.log(i);
  }.bind(null,i), 1000);
}
```
当然还可以这样，也许你不知道setTimeout方法可以传3个以上的参数：

```js
for (var i = 0; i < 5; i++) {
  setTimeout(function(i) {
    console.log(i);
  }, 1000, i);
}
```
不过现在有了ES6，其实只要改3个字母就可以咯：

```js
for (let i = 0; i < 5; i++) {
  setTimeout(function() {
    console.log(i);
  }, 1000);
}
```

前面也说过，这个和主要想写的没啥关系，其实最近看了很多关于时间循环机制（event loop）的东西，打算在下一篇整理一下~