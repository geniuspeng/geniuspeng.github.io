title: task-and-job
date: 2017-11-15 17:50:41
categories: JavaScript
tags:
- task 
- event loop
---

讲道理，从16年3月入前端的坑，到现在总觉得好歹也应该够了解js了，不过最近看到关于setTimeout (fn, 0)突然让我想到了刚学js的时候就一知半解的Event Loop，还有相关的Task queue,后来听说过的Macro task，Micro task(当然只是听说，啥也不懂)。今天把最近学到的一些东西整理一下，还是从一道题开始吧~
<!--more-->

```js
console.log('global1');
setTimeout(function() {
    console.log('timeout1');
})

new Promise(function(resolve) {
    console.log('promise1');
    for(var i = 0; i < 1000; i++) {
        i == 99 && resolve();
    }
    console.log('promise2');
}).then(function() {
    console.log('then1');
})

console.log('global2');
```
对就是酱紫，而且这是一个简单版本，相信有很多小伙伴也看过这种，也知道结果。对于我来说，先前知道的可能也就是setTimeout (fn, 0)会把回调放到一个任务队列（task queue）里，ajax回调也是，Promise的resolve回调也是，dom事件监听（click等）同样，这些回调脱离了主线程，而在主线程空闲下来的时候去执行这些回调，但又不是完全结束之后，而是在适当的时机执行适当的回调。。。什么乱七八糟的啊~！@%#……￥&就是说，如果ajax请求结果很慢是不是就要很后面执行？setTimeout和ajax，Promise都有什么顺序关系吗？为什么上面的Promise的then一定要timeout前面？
所以说，之前我只知道有一些callback会延迟执行，放到一个什么任务队列里，但具体是什么样的，时间循环怎么循环的，基本上是处于完全混乱状态。
今天在这里整理一下~
看了很多文章，基本的解释都一样，最通俗的解释就是，我们执行js代码需要一个函数调用栈（我这就叫执行栈吧），需要执行什么就push进去执行，执行过后再释放，所有的方法都是依赖于这个执行栈。而我们有两种任务类型宏任务macro-task，和微任务micio-task，它们都依赖于执行栈去执行。
- macro-task大概包括：script(整体代码), setTimeout, setInterval, setImmediate, I/O, UI rendering。
- micro-task大概包括: process.nextTick, Promise, Object.observe(已废弃), MutationObserver(html5新特性)。
而执行整体代码时，直接执行的直接放到执行栈中，遇到相应的task则放在其对应的task queue中。
*一个事件循环从macro-task开始执行，当前执行栈没有可执行的东西时，开始执行micro-task的内容，然后开启下一个事件循环。而setTimeout被放入macro-task的队列，所以要等到下一个循环才能出来。*这就解释了为什么timeout在then后面。
我说的好像很乱，他[这里](http://www.jianshu.com/p/12b9f73c5a4f#)有图,可以参照这个去理解一下~
其实这篇文章已经写得很详细了，基本原理就是这样，还给了很长的例子来图解~~只是看完我突然想到，事件监听的回调，或者ajax的回调，放到这里会是什么样呢？理论上这些回调应该是属于macro-task（至于为什么一会再说），于是我在上面加了几句话：

```js
console.log('global1');
setTimeout(function() {
    console.log('timeout1');
})
var btn = document.createElement('button');
btn.onclick = function() {
    console.log('click')
};
btn.click();
new Promise(function(resolve) {
    console.log('promise1');
    for(var i = 0; i < 1000; i++) {
        i == 99 && resolve();
    }
    console.log('promise2');
}).then(function() {
    console.log('then1');
})

console.log('global2');
```
不出所料，click在global1和global2之间输出的。也就是说，立即点击的按钮虽然放了回调，但是它的回调什么时候入栈执行取决于什么时候点击，就是点击的时机，如果点击就是在第一个event loop中，那就是在第一个event loop中执行。当然在实际中，我们点击某个按钮肯定不会在第一个event loop，这里的第一个指的就是整体script，我们在某个时机点击，点击的时候才将console.log('click')放入相应的任务队列，而这个队列应该处于未来的某次循环中，而且这个应该属于event task，与setTimeout是不同的任务源，应该是不同的任务队列。从这里基本上就可以知道，其实将callback放入队列（macro-task或micro-task）的时机是不确定的，setTimeout设置5000的话应该就是5秒之后放入，对于点击则是具体click的时候，那么ajax应该就是返回请求完成的时候，取决于这次请求到底花了多久。

————————————————————————————————我是分隔线——————————————————————————————————————————
以上是我自己的理解，写得也比较乱，下面从规范的角度重新把这个问题捋一捋...

### 关于event loop
以下几点可以从[event loop](https://www.w3.org/TR/html5/webappapis.html#event-loop)规范中整理出来
1. event loop依赖于浏览器环境（这里不考虑node中的event loop以及worker中的event loop），1个浏览器环境至多有1个event loop，如果这个浏览器环境销毁，event loop也随之消失。
2. 一个event loop可以有1个或多个任务队列（task queues）。
3. 一个task queue是一列有序的task，用来做以下工作：Events task，Parsing task， Callbacks task， Using a resource task， Reacting to DOM manipulation task等。
4. 每一个task都和相应的document相关联，一般这个documnet就是当前script所在的浏览器上下文的document。event loop用来处理相应document下的tasks。
5. 每一个task都有相应的task source（任务源），从同一个task source来的task必须放到同一个task queue，从不同源来的则被添加到不同task queue。
6. 每个(task source对应的)task queue都保证自己队列的先进先出的执行顺序，但event loop的每个turn，是由浏览器决定从哪个task source挑选task。这允许浏览器为不同的task source设置不同的优先级，比如为用户交互设置更高优先级来使用户感觉流畅。

### 关于Job，Job queues
来看[ES20-15](http://ecma-international.org/ecma-262/6.0/index.html#sec-jobs-and-job-queues)规范中提到的Job和Job queues
![](https://pic4.zhimg.com/5014ab6454bc214f76e3260fb68c3a1b_r.png)
一个Job Queue是一个先进先出的队列。一个ECMAScript实现必须至少包含以上两个Job Queue。
以下又强调了，单独的任务队列中的任务总是按先进先出的顺序执行，但是不保证多个任务队列中的任务优先级，具体实现可能会交叉执行。
![](https://pic4.zhimg.com/50/0c6864c8a0e8a5f7f5abd8f9ddcddbe3_hd.jpg)
跟随PromiseJobs到25.4章节，可以看到
![](https://pic4.zhimg.com/fed4b5f8710e3c3473e12a181394845f_b.png)
promise中reslove（fullfilled）的部分会把一个任务放到名为“PromiseJobs”的任务队列中，其实就是我们所说的micro-task。

综上从task和job两个规范可以得出，EcmaScript的Job queue与HTML的Task queue有异曲同工之妙。它们都可以有好几个，多个任务队列之间的顺序都是不保证的。但是，有一点可以确定，在当前的event loop的一次turn中，micro-task应该是在macro-task之后执行。
为什么呢？还是那个问题，为什么micro在macro后面，也就是为什么Promise的then在timeout后面？
这里有一个翻译的[图灵社区 : 阅读 : 【翻译】Promises/A+规范](http://www.ituring.com.cn/article/66566),在这篇文章中提到了所谓的macro-task和micro-task。有一个关键点就是script（整体代码）属于macro-task，我们从整体代码开始执行，在macro中遇到Promise产生了micro任务，遇到settimeout产出了新的macro任务，而settimeout产生的新的macro任务不会放到当前的循环中了，只能等到下一个循环的macro中去执行，而micro任务则可以在当前循环macro任务全部完成之后开始依次执行。
这里还有个问题，就是为什么settimeout不能放在当前的循环中呢。之前说的setTimeout (fn, 0)，之前说过不同task source（任务源）会放入不同的task queue（任务队列），所以setTimeout的回调会进入一个单独存放setTimeout的task queue（任务队列），而不可能放入当前整体代码的marco-task队列，即使我们将延迟时间设置为0，它定义的操作仍然需要等待所有代码执行完毕之后才开始执行。这里的延迟时间，并非相对于setTimeout执行这一刻，而是相对于其他代码执行完毕这一刻。所以说setTimeout方法不可能在当前循环的macro任务中执行。

好吧扯了一大堆，现在来把最开始那个题简单梳理一下~~~~
首先，全局代码（整体script）在macro-task中。
1. 从整体代码的macro-task开始执行，执行到global1，直接放到执行栈中执行，直接输出。
2. 遇到setTimeOut，将此回调放到setTimeOut任务源的macro-task队列中，具体什么时候放取决于setTimeOut的第二个参数。
3. 遇到了Promise，这里面的参数fn属于当前整体代码的macro-task，会立即执行，输出promise1。
4. for循环并不会导致进入其他任务队列，遇到resolve方法并执行。
5. 继续执行输出promise2。
6. Promise的构造函数中resolve执行完毕的情况下，遇到then方法，从当前的macro-task创建了一个micro-task，并将这里resolve的回调（也就是then中的内容）打入这个micro-task队列。
7. 继续执行，输出global2。
8. 整体代码已经没有可执行的东西了，说明此次循环macro-task结束，开始执行micro-task队列，输出then1。
9. 当前循环的micro-task也没东西了，开始下一次循环，只剩下setTimeOut的那个队列，输出timeout1。

————————————————————————————————我也是分隔线——————————————————————————————————————————
刚刚的macro-task和micro-task都有提到node中关于定时器的一些东东比如setImmediate，process.nextTick等，setImmediate比较好说，可以初步理解为一个延迟为0的setTimeOut，当然是有一些区别不在这里详细介绍，输入macro-task。这里需要说明的一点是process.nextTick，按照归类它属于micro-task，那么看这个

```js
new Promise((res) => {
    console.log('promise')
    res()
}).then(() => console.log(2))
process.nextTick(() => console.log('nexttick'))
```
在node中执行结果process.nextTick()永远是优先于Promise的。这个似乎用上面的逻辑解释不通，nextTick中的可执行任务执行完毕之后，才会开始执行Promise队列中的任务。实际上在v8中，process.nextTick()严格来讲并不完全属于micro-task，看一下[node的源码](https://github.com/nodejs/node/blob/master/lib/internal/process/next_tick.js)：

```js
// Run callbacks that have no domain.
  // Using domains will cause this to be overridden.
  function _tickCallback() {
    do {
      while (tickInfo[kIndex] < tickInfo[kLength]) {
        ++tickInfo[kIndex];
        const tock = nextTickQueue.shift();
        const callback = tock.callback;
        const args = tock.args;

        // CHECK(Number.isSafeInteger(tock[async_id_symbol]))
        // CHECK(tock[async_id_symbol] > 0)
        // CHECK(Number.isSafeInteger(tock[trigger_async_id_symbol]))
        // CHECK(tock[trigger_async_id_symbol] > 0)

        emitBefore(tock[async_id_symbol], tock[trigger_async_id_symbol]);
        // emitDestroy() places the async_id_symbol into an asynchronous queue
        // that calls the destroy callback in the future. It's called before
        // calling tock.callback so destroy will be called even if the callback
        // throws an exception that is handles by 'uncaughtException' or a
        // domain.
        // TODO(trevnorris): This is a bit of a hack. It relies on the fact
        // that nextTick() doesn't allow the event loop to proceed, but if
        // any async hooks are enabled during the callback's execution then
        // this tock's after hook will be called, but not its destroy hook.
        if (async_hook_fields[kDestroy] > 0)
          emitDestroy(tock[async_id_symbol]);

        // Using separate callback execution functions allows direct
        // callback invocation with small numbers of arguments to avoid the
        // performance hit associated with using `fn.apply()`
        _combinedTickCallback(args, callback);

        emitAfter(tock[async_id_symbol]);

        if (kMaxCallbacksPerLoop < tickInfo[kIndex])
          tickDone();
      }
      tickDone();
      _runMicrotasks();
      emitPendingUnhandledRejections();
    } while (tickInfo[kLength] !== 0);
  }
```
从这里可以看出，_tickCallback 执行时不断取 nextTickQueue 中元素并执行。执行完以后，执行 _runMicrotasks() ，也就是执行 microtasks 。从这个角度来说，nextTick 和 microtask 是同一层级的。而_runMicrotasks() 调用 v8 的 RunMicrotasks，处理 v8 的 microtasks。而从实际效果来说，process.nextTick 被看作 microtask 没有问题。


<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/3.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/3.0/80x15.png" /></a><br />本作品采用<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/3.0/">知识共享署名-非商业性使用-禁止演绎 3.0 未本地化版本许可协议</a>进行许可。