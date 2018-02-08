title: Vue源码--解读vue响应式原理
date: 2018-01-05 14:55:11
categories: 前端
tags: [vue, 源码, JavaScript]
---
Vue的官方说明里有[深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)这一节。在此官方也提到过：
> 当你把一个普通的 JavaScript 对象传给 Vue 实例的 data 选项，Vue 将遍历此对象所有的属性，并使用 Object.defineProperty 把这些属性全部转为 getter/setter。Object.defineProperty 是 ES5 中一个无法 shim 的特性，这也就是为什么 Vue 不支持 IE8 以及更低版本浏览器的原因。

官网只是说了一个大概原理，浏览了一下vue的源码以及其他关于此处的解释，这一块其实可以总结为两点：利用Object.defineProperty进行数据劫持同时结合观察者模式（发布/订阅模式）来实现数据双向绑定，这也是vue响应式原理的核心。首先先把这两个东西简单介绍一下吧~

<!--more-->

### 关于Object.defineProperty
关于[Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)我觉得还是MDN上说的更明白详细一些，我写在这里无非是一些ctrl C+V，总之我们要知道它是一个定义属性描述符的东西，可以劫持一个对象属性的getter和setter，而Vue正是通过在属性改变时劫持这些来通知watcher（后文会讲）。下面这个例子实现了一个极简的双向绑定：

<p data-height="300" data-theme-id="15655" data-slug-hash="dJVeGj" data-default-tab="js,result" data-user="geniuspeng" data-embed-version="2" data-pen-title="极简的双向绑定" class="codepen">See the Pen <a href="https://codepen.io/geniuspeng/pen/dJVeGj/">极简的双向绑定</a> by Yunpeng Bai (<a href="https://codepen.io/geniuspeng">@geniuspeng</a>) on <a href="https://codepen.io">CodePen</a>.</p><script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>

它的效果就是，input框输出改变的时候，span的内容随之改变，同时如果在控制台直接改变obj.hello属性，input和span的内容同时会一起变化（验证这个得去codepen页面中的console控制台），其原理就是利用Object.defineProperty劫持了属性的set方法。


### 关于观察者模式
观察者模式（有时又被称为发布（publish ）-订阅（Subscribe）模式）是软件设计模式的一种。在此种模式中，一个目标物件管理所有相依于它的观察者物件，并且在它本身的状态改变时主动发出通知。这通常透过呼叫各观察者所提供的方法来实现。此种模式通常被用来实现事件处理系统。
观察者模式根据具体不同的场景可以实现出不同的版本，但其核心思想没有变化,下面是根据vue源码简化出来的一个简单模型

```js
function Dep() {//主题对象
  this.subs = []; //订阅者列表
}
Dep.prototype.notify = function() { //主题对象通知订阅者
  this.subs.forEach(function(sub){ //遍历所有的订阅者，执行订阅者提供的更新方法
    sub.update();
  });
}
function Sub(x) { //订阅者
  this.x = x;
}、
Sub.prototype.update = function() { //订阅者更新
  this.x = this.x * this.x;
  console.log(this.x);
}
var pub = { //发布者
  publish: function() {
    dep.notify();
  }
};
var dep = new Dep(); //主题对象实例
Array.prototype.push.call(dep.subs, new Sub(1), new Sub(2), new Sub(3)); //新增 3 个订阅者
pub.publish(); //发布者发布更新
// 1
// 4
// 9
```

首先有3个主体：发布者，主题对象，订阅者，其中发布者和主题对象是一对一的（某些其他场景可能一对多？），而主题对象和订阅者也是一对多的关系。发布者通过发布某个主题对象，主题对象更新并通知其所有的订阅者，然后每个订阅者执行update进行更新。
**对于Vue，我们这里可以认为Vue实例中的data中的每一项属性是一个Dep，而所有用到这个属性的地方都是这个Dep的一个订阅者（sub），当这个属性值变化时，观察者通过监听捕获变化，告诉这个dep去notify每一个订阅者。**

### Observer ，Dep和Watcher
Observer、Watcher、Dep 是响应式原理中涉及到的 3 个重要的对象,可以说分别上面的发布者，主体对象，订阅者相对应。其关系可以简化为下图所示：
![https://geniuspeng.github.io/image-storage/blog/vue/vue-reactivity.png](https://geniuspeng.github.io/image-storage/blog/vue/vue-reactivity.png?w=651&h=327)

#### Observer对象
这个东西，字面意思是一个观察者，我个人理解就是上面所说的Object.defineProperty + 发布者的结合体，它的主要功能是做数据劫持，在数据获得更新的时候（拦截set方法），执行主题对象（Dep）的notify方法，通知所有的订阅者（Watcher）。
Observer类定义在[src/core/observer/index.js](https://github.com/vuejs/vue/blob/v2.5.13/src/core/observer/index.js#L40-L54)中，先来看一下Observer的构造函数: 
```js
  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
```
value是需要被观察的数据对象，在构造函数中，会给value增加__ob__属性，作为数据已经被Observer观察的标志。如果value是数组，就使用observeArray遍历value，对value中每一个元素调用observe分别进行观察。如果value是对象，则使用walk遍历value上每个key，对每个key调用defineReactive来获得该key的set/get控制权。
在[src/core/observer/index.js](https://github.com/vuejs/vue/blob/v2.5.13/src/core/observer/index.js)中还有几个方法，大致解释如下
- observeArray: 遍历数组，对数组的每个元素调用observe
- observe: 检查对象上是否有__ob__属性，如果存在，则表明该对象已经处于Observer的观察中，如果不存在，则new Observer来观察对象（其实还有一些判断逻辑，为了便于理解就不赘述了）
- walk: 遍历对象的每个key，对对象上每个key的数据调用defineReactive
- defineReactive: 通过Object.defineProperty设置对象的key属性，使得能够捕获到该属性值的set/get动作。一般是由Watcher的实例对象进行get操作，此时Watcher的实例对象将被自动添加到Dep实例的依赖数组中，在外部操作触发了set时，将通过Dep实例的notify来通知所有依赖的watcher进行更新。（后面详细介绍）

defineReactive方法如下，这是observer类的一个核心方法：
```js
function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}

```
defineReactive 是对 Object.defineProperty 方法的包装，结合 observe 方法对数据项进行深入遍历，最终将所有的属性就转化为 getter 和 setter。至此，所有的数据都已经转换为 Observer 对象。即数据的读操作都会触发 getter 函数，写操作都会触发 setter 函数。
那走到这里，会有很多问题，比如Dep在哪？如何往Dep中添加订阅者？

### Dep对象
Dep类定义在[src/core/observer/dep.js](https://github.com/vuejs/vue/blob/v2.5.13/src/core/observer/dep.js)中。
Dep是Observer与Watcher之间的纽带，也可以认为Dep是服务于Observer的订阅系统。Watcher订阅某个Observer的Dep，当Observer观察的数据发生变化时，通过Dep通知各个已经订阅的Watcher。其构造函数和主要方法如下。其中sub就是订阅者Watcher，在后文介绍：
```js
class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update()
    }
  }
}
Dep.target = null
```
Dep提供了如下几个方法：
- addSub: 接收的参数为Watcher实例，并把Watcher实例存入记录依赖的数组中
- removeSub: 与addSub对应，作用是将Watcher实例从记录依赖的数组中移除
- depend: Dep.target上存放这当前需要操作的Watcher实例，调用depend会调用该Watcher实例的addDep方法，addDep的功能可以看下面对Watcher的介绍
- notify: 通知依赖数组中所有的watcher进行更新操作

### Watcher对象
Watcher类定义在[src/core/observer/watcher.js](https://github.com/vuejs/vue/blob/v2.5.13/src/core/observer/watcher.js)。其构造函数如下：
```js
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = function () {}
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }
```
watcher实例有这些方法：
- get: 将Dep.target设置为当前watcher实例，在内部调用this.getter，如果此时某个被Observer观察的数据对象被取值了，那么当前watcher实例将会自动订阅数据对象的Dep实例
- addDep: 接收参数dep(Dep实例)，让当前watcher订阅dep
- cleanupDeps: 清除newDepIds和newDep上记录的对dep的订阅信息
- update: 立刻运行watcher或者将watcher加入队列中等待统一flush
- run: 运行watcher，调用this.get()求值，然后触发回调
- evaluate: 调用this.get()求值
- depend: 遍历this.deps，让当前watcher实例订阅所有dep
- teardown: 去除当前watcher实例所有的订阅

Observer，Dep，Watcher所有的代码都过一遍之后，再来回头看看究竟是如何添加订阅者的。说白了就是Dep中的this.subs = []方法如何添加相应的订阅者watcher的。在这里还应该列出两个重要的方法，watcher的get（）方法：
```js
  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        dep.addSub(this)
      }
    }
  }
```

我们在Dep中可以看到Dep在一开始定义了一个全局属性Dep.target，在新建watcher是，这个属性为null，而在watcher的构造函数中最后会执行自己的get（）方法，进而执行pushTarget(this)方法，可以看到get()方法中做了一件事情：value = this.getter.call(vm, vm)，然后popTarget（）。Dep.target只是一个标记，存储当前的watcher实例，而执行这句话的意义在于触发Object.defineProperty中的get拦截，而在bject.defineProperty中的get那里，我们可以看到dep.depend()，正是在这里将当前的订阅者watcher绑定当Dep上。
也就是说，每个watcher第一次实例化的时候，都会作为订阅者订阅其相应的Dep。
而关于watcher何时进行实例化的问题，模板渲染初始化相关指令调用data中的属性，或者正常进行数据绑定时都会创建watcher实例。
__PS: 在模板渲染过程中，vue1.x与vue2.x完全不同，1.x是利用documentFragment来实现，而2.x向react靠拢，加入了virtual dom，同时通过自己生产的render方法进行渲染，不过无论是那种方法，都会在初始时对所关联的data属性进行watcher实例化并且绑定watcher变化时的更新callback，确保data更新时会重新对相应的地方进行视图更新。__


总结一下：

1. 模板编译过程中的指令和数据绑定都会生成 Watcher 实例，watch 函数中的对象也会生成 Watcher 实例，在实例化的过程中，会调用 watcher.js 中的 get 函数 touch 这个 Watcher 的表达式或函数涉及的所有属性；
2. touch 开始之前，Watcher 会设置 Dep 的静态属性 Dep.target 指向其自身，目的在于标记此watcher实例是第一次创建，需要添加到一个Dep中；
3. touch 属性的过程中，属性的 getter 函数会被访问；
4. 属性 getter 函数中会判断 Dep.target（target 中保存的是第 2 步中设置的 Watcher 实例）是否存在，若存在则将 getter 函数所在的 Observer 实例的 Dep 实例保存到 Watcher 的列表中，并在此 Dep 实例中添加 Watcher 为订阅者；
5. 重复上述过程直至 Watcher 的表达式或函数涉及的所有属性均 touch 结束（即表达式或函数中所有的数据的 getter 函数都已被触发），Dep.target 被置为 null，此时已经将该watcher作为订阅者绑定到Dep中；

---
参考链接
- [官方文档：深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)
- [Vue2.0源码解读：响应式原理](http://zhouweicsu.github.io/blog/2017/03/07/vue-2-0-reactivity/)
- [Vue原理解析之 observer 模块](https://segmentfault.com/a/1190000008377887)
- [剖析Vue原理&实现双向绑定MVVM](https://segmentfault.com/a/1190000006599500)

