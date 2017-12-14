title: 从源码角度实现一个自己的Promise
date: 2017-12-14 11:12:18
categories: JavaScript
tags: [Promise]
---

关于Promise的概念以及意义就不在这里介绍了，最近看到了一些实现Promise的核心思想，在这里整理一下。写这篇文章并不是为了实现一个自己的Promise，毕竟现在es6已经标准支持，而且还有一大堆的第三方Promise库，主要是为了从最底层的角度深入理解一下Promise的实现思路。
<!--more-->

### 1.从状态机出发
我们知道，Promise的作用在于包裹一个异步（或同步）操作，然后通过then方法实现这个操作成功（或失败）的回调，而这其中的原理则是可以通过一个类似状态机的机制来控制。首先需要明确几个概念，这些概念可以从Promise/A的API规范中找到：
- Promise（中文：承诺）其实为一个有限状态机，共有三种状态：pending（执行中）、fulfilled（执行成功）和rejected（执行失败）。

- 其中pending为初始状态，fulfilled和rejected为结束状态（结束状态表示promise的生命周期已结束）。

- 状态转换关系为：fulfill方法(pending->fulfilled)，reject(pending->rejected)，此状态转换不可逆。

- 随着状态的转换将触发各种事件（如执行成功事件、执行失败事件等）。 

根据这些信息，我们就可以得出一个Promise的初始模型：

```js
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise() {
  //存储状态：PENDING, FULFILLED or REJECTED
  let state = PENDING;

  //存储 FULFILLED 或者 REJECTED时传入的参数value
  let value = null;

  // 存储
  let handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
  }
}
```
### 2.实现handle方法
有了上面的初始模型，接下来需要一个resolve方法，我们知道new Promise（）的时候传入的参数是一个function，而这个function有两个参数resolve和reject，并且这两个参数都是一个function，就是说是一个带了两个function参数的function。而里面的resolve和reject方法决定了这个Promise的走向（fulfill方法还是reject），我们的handle方法就是决定这个走向用的，说起来有点绕，看一下handle大致做了什么。

```js
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn) {
  //存储状态：PENDING, FULFILLED or REJECTED
  let state = PENDING;

  //存储 FULFILLED 或者 REJECTED时传入的参数value
  let value = null;

  // 存储
  let defers = null;

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handle(defers);
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    handle(defers);
  }

  function handle(handler) {
    if (state === PENDING) {
      defers = handler;
    } else {
      if (state === FULFILLED) {
        //do sth fulfilled
      }
      if (state === REJECTED) {
        //do sth rejected
      }
    }
  }
  fn(fulfill, reject);
}
```

### 3.实现then方法
then方法接受两个参数，分别是fulfill方法之后的回调onResolved以及reject之后的回调onRejected。同时因为Promise内的方法可能是同步页可能是异步，为了保证handle都能正常执行，我们需要一个defers变量，这样同步情况下，fulfill方法不会执行handle，而是到then的时候再执行handle，处于一个完全同步状态，而异步情况，在pending的时候将相应的handler存到defer中，直到fulfill的时候去进行处理。
```js
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn) {
  //存储状态：PENDING, FULFILLED or REJECTED
  let state = PENDING;

  //存储 FULFILLED 或者 REJECTED时传入的参数value
  let value = null;

  //存储异步情况相应的handler
  let defers = null;

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    if (defers) {
      handle(defers);
    }
    
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    if (defers) {
      handle(defers);
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      defers = handler;
    } else {
      if (state === FULFILLED) {
        handler.onFulfilled(value);
      }
      if (state === REJECTED) {
        handler.onRejected(value);
      }
    }
  }
  this.then = function(onFulfilled, onRejected) {
    handle({
      onFulfilled,
      onRejected
    });
   };
  fn(fulfill, reject);
}

```
到这里基本的逻辑已经出来了，但实际上还有很多可以改进的地方。比如Promise不仅仅可以接收一个单独的值，同样可以接收一个Promise对象，而then的返回值也是一个Promise对象，也就是完全支持链式调用。下面从这两个角度出发，进行完善。

### 支持Promise参数
resolve 既可以接受一个 Promise，也可以接受一个基本类型。当 resolve 一个 Promise 时，就成了酱紫：
```js
new Promise(function(resolve, reject) {
  resolve(new Promise(function(resolve, reject) {
    resolve('aaa')
  }))
})
.then(function(v) {
  console.log(v);
})
```
我们上面的方法就无法达到效果，这时我们需要一个新的方法来进行改进，可以把这个方法就叫做resolve，而之前的fulfill方法我们仅仅当做是一个改变state状态的方法，也就是说简单来说，resolve其实就是改进了一下fulfill，那么最开始其实就是 这样：
```js
function resolve(result) {
  fulfill(result)
}
fn(resolve, reject);
```
嗯就这样，下面开始改进。因为resolve可能接收一个Promise对象，Promise一定有then方法，我们可以对这点进行一个判断，是否为Promise对象进行不同的处理，同时还需要一个doResolve方法进行对传入的Promise对象的递归处理（因为传入的Promise对象rosolve的可能还是个Promise对象，不一定嵌套了多少层- -）...这两个方法实现如下：
```js
function getThen(obj) {
  try {
    return obj.then;
  } catch (e) {
    throw new Error(e);
    return null;
  }
}
function doResolve (fn, onFulfilled, onRejected) {
  let done = false
  try {
    fn(function (value) {
      if (done) return
      done = true
      // 执行由 resolve 传入的 resolve 回调
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}
function resolve (result) {
  try {
    let then = getThen(result)
    if (then) {
      // 递归 resolve 待解析的 Promise
      doResolve(then.bind(result), resolve, reject)
      return
    }
    fulfill(result)
  } catch (e) {
    reject(e)
  }
}
```
getThen其实很简单，就是判断这个对象是否有then方法，如果有，我们当做Promise处理，通过doResolve来递归resolve方法，直到遇到的不是Promise对象为止，resolve出真正的值。而doResolve大致就是一个tryCallTwo的功能，让第一个fn参数以后两个参数为参数去执行,即做了最开始fn(resolve, reject)的工作，类似这样：
```js
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    return ex;
  }
}
```
同时doResolve需要确保 onFulfilled 与 onRejected 只会被调用一次，而我们的最后一行的fn(resolve, reject)需要替换成doResolve(fn, resolve, reject),至此为止，完整的实现为（getThen和doResolve做为两个辅助函数，为了更清晰，我们放在Promise外面）：
```js
function getThen(obj) {
  try {
    return obj.then;
  } catch (e) {
    throw new Error(e);
    return null;
  }
}
function doResolve (fn, onFulfilled, onRejected) {
  let done = false
  try {
    fn(function (value) {
      if (done) return
      done = true
      // 执行由 resolve 传入的 resolve 回调
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn) {
  //存储状态：PENDING, FULFILLED or REJECTED
  let state = PENDING;

  //存储 FULFILLED 或者 REJECTED时传入的参数value
  let value = null;

  //存储异步情况相应的handler
  let defers = null;

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    if (defers) {
      handle(defers);
    }
    
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    if (defers) {
      handle(defers);
    }
  }

  function resolve (result) {
    try {
      let then = getThen(result)
      if (then) {
        // 递归 resolve 待解析的 Promise
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result)
    } catch (e) {
      reject(e)
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      defers = handler;
    } else {
      if (state === FULFILLED) {
        handler.onFulfilled(value);
      }
      if (state === REJECTED) {
        handler.onRejected(value);
      }
    }
  }
  this.then = function(onFulfilled, onRejected) {
    handle({
      onFulfilled,
      onRejected
    });
   };
  doResolve(fn, resolve, reject)
}
```

### 优化handle方法
这里的handle方法有一点小问题，首先，handle传入参数handler，这个handler这里可以看出是then带过来的一个对象，其中包含了成功和拒绝两个状态的回调onFulfilled, onRejected，当然我们在then中完全可以不写参数（虽然这样没有了then的意义），比如这样
```js
new Promise(function(resolve, reject) {
  resolve('sth')
}).then();
```
这种情况会因为handler.onFulfilled或者handler.onRejected不存在而导致报错，于是可以把handle方法稍微优化一下：
```js
function handle(handler) {
  if (state === PENDING) {
    defers = handler;
  } else {
    let handlerCallback;
    if (state === FULFILLED) {
      handlerCallback = handler.onFulfilled || null;
    } else {
      handlerCallback = handler.onRejected || null;
    }

    if (handlerCallback) {
      handlerCallback(value);
    }
  }
}
```
通过一个handlerCallback存储回调。。。没有的时候，就什么也不做就可以了。

### 实现链式调用
我们都知道，then方法的回调可以return一个值，而then方法本身返回的是一个Promise，而这个Promise中resolve的结果就是这个return的值，所以可以实现完整的链式调用，对于这一点，我们只需要把上述的then方法稍微加工一下，让它返回一个Promise：
```js
this.then = function(onFulfilled, onRejected) {
  return new Promise(function(resolve, reject) {
    handle({
      onFulfilled,
      onRejected,
      resolve,
      reject
    });
  })
 };
```
then方法改了之后，handle方法也需要进行一些改进,因为此时handle的参数handler不仅仅有onFulfilled, onRejected这两个回调，还需要传入then返回的Promise的reslove和reject方法。而传给下一个then（链式）的值就是这个resolve所解析出来的value，所以在这个handle方法的最后，一定要resolve这个value。
```js
function handle(handler) {
  if (state === PENDING) {
    defers = handler;
  } else {
    let handlerCallback = null;
    if (state === FULFILLED) {
      handlerCallback = handler.onFulfilled;
    } else {
      handlerCallback = handler.onRejected;
    }

    if (!handlerCallback) {
      if (state === FULFILLED) {
        handler.resolve(value);
      } else {
        handler.reject(value);
      }
      return;
    }

    const ret = handlerCallback(value);
    handler.resolve(ret);
  }
}
```

把优化后的再整理一下：
```js
function getThen(obj) {
  try {
    return obj.then;
  } catch (e) {
    throw new Error(e);
    return null;
  }
}
function doResolve (fn, onFulfilled, onRejected) {
  let done = false
  try {
    fn(function (value) {
      if (done) return
      done = true
      // 执行由 resolve 传入的 resolve 回调
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}
const PENDING = 0;
const FULFILLED = 1;
const REJECTED = 2;

function Promise(fn) {
  //存储状态：PENDING, FULFILLED or REJECTED
  let state = PENDING;

  //存储 FULFILLED 或者 REJECTED时传入的参数value
  let value = null;

  //存储异步情况相应的handler
  let defers = null;

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    if (defers) {
      handle(defers);
    }
    
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    if (defers) {
      handle(defers);
    }
  }

  function resolve (result) {
    try {
      let then = getThen(result)
      if (then) {
        // 递归 resolve 待解析的 Promise
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result)
    } catch (e) {
      reject(e)
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      defers = handler;
    } else {
      let handlerCallback = null;
      if (state === FULFILLED) {
        handlerCallback = handler.onFulfilled;
      } else {
        handlerCallback = handler.onRejected;
      }

      if (!handlerCallback) {
        if (state === FULFILLED) {
          handler.resolve(value);
        } else {
          handler.reject(value);
        }
        return;
      }

      const ret = handlerCallback(value);
      handler.resolve(ret);
    }
  }
  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle({
        onFulfilled,
        onRejected,
        resolve,
        reject
      });
    })
   };
  doResolve(fn, resolve, reject)
}
```
到此为止，基本上的功能已经完成了，当然，ES6标注的Promise还有Promise.all,Promise.race等方法，不过只要Promise的基本实现原理弄明白了，这些扩展起来也是很简单事情。
还有一点需要注意，Promise内部是纯异步实现的，即使是同步直接传入一个resolve值也会是异步完成，在ES6标准中的Promise是通过Job Queue来完成（可以参考以前的文章Micro-task），在这里我们可以通过setTimeout来简单模拟一下，虽然不完全相同（setTimeout属于Macro-task），但是可以大体上实现纯异步的效果。

```js
function handle(handler) {
  if (state === PENDING) {
    defers = handler;
  } else {
    setTimeout(() => {
      let handlerCallback = null;
      if (state === FULFILLED) {
        handlerCallback = handler.onFulfilled;
      } else {
        handlerCallback = handler.onRejected;
      }

      if (!handlerCallback) {
        if (state === FULFILLED) {
          handler.resolve(value);
        } else {
          handler.reject(value);
        }
        return;
      }

      const ret = handlerCallback(value);
      handler.resolve(ret);
    }, 0)
  }
}
```
嗯就酱~~~~参考链接：

-[Promise MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-[阮一峰--ES6标准——Promise](http://es6.ruanyifeng.com/?search=mixin&x=0&y=0#docs/promise)
-[implements Promise in a very similar way.](https://github.com/then/promise/blob/master/src/core.js)
-[promisejs.org](https://www.promisejs.org/)
-[【翻译】Promises/A+规范](http://www.ituring.com.cn/article/66566)


