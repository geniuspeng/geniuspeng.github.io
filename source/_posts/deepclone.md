title: "深入分析deepclone"
date: 2015-08-17 19:22:35
categories: JavaScript
tags: JavaScript
---
最开始看到深度克隆（DeepClone）这个词，完全不理解是什么意思。复制就复制嘛，干嘛还搞写什么深浅的？后来随着对JS理解的深入，也就慢慢理解了这个词的含义~这个问题，其实说来也很简单，但看似又不那么简单。
<!--more-->
说到DeepClone，还要从JS那个“一切皆为对象”说起，JS的数据类型有6种，其中5中基本类型（string，boolean，number，null，undefined）和1中引用类型（Object），而这种引用类型又生了很多“儿子”，除了String，Boolean，Number这些包装类型，还有Array，Function，RegExp，Date等等。
那么，所谓克隆（复制），大家都理解，就是弄一个跟原来的东东一模一样的东东- -所以说，既然是这样，直接赋值不就搞定了么，我最开始就是这么想的，弄这么复杂搞了个什么“深度复制”和直接赋值有什么区别？例如现在有个基本类型a，我想把它复制到b上面去：

```
var a = 1;
var b = a;
a = 10;
console.log(b); // 1

var a = 'hello';
var b = a;
a = 'world';
console.log(b); // hello

var a = true;
var b = a;
a = false;
console.log(b); // true
```

从代码中可以看出，对于数字，字符串，和布尔类型的基本类型变量，直接赋值即可完成复制。那么对于引用类型呢？这里首先想到Function类型，它虽然继承自Object，然而在JS中函数总是感觉有一些特殊性：

```
var a = function() {console.log(1);};
var b = a;
a = function() {console.log(2);};
b(); // 1
```
因为JS中函数是可以赋值给一个变量的，将这个变量直接复制给另一个变量，这样看来a的函数似乎直接被赋值给了b，可以完成复制，而实际上确实如此，如果单独说复制一个函数是可以像基本类型那样直接赋值来搞定的。然而如果根据JS的存储机制，引用类型（对象）所谓的复制并不像基本类型那样简单，实际上只是复制了当前对象的指针而已，即让新的变量的指针指向被复制对象。

```
var a = function() {console.log(1);};
a.tmp = 10;
var b = a;
a.tmp = 20;
console.log(b.tmp); // 20
```
这样就很容易看出来问题了，如果说给这个变量一个额外的属性tmp，它们共同指向内存中一片区域，赋值之后改变这个属性的值那么，复制对象b的tmp属性也会随之改变。对于其他引用类型来说，这个问题将更加直观：

```
var a = [0, 1, 2, 3];
var b = a;
a.push(4);
console.log(b); // [0, 1, 2, 3, 4]
```
咳咳咳，一目了然，就是说，直接赋值顶多可以称得上是一种“浅复制”，对于基本类型来说没有问题，如果是引用类型，只是复制了指向这个对象的指针，而并没有完全复制其内容。所以DeepClone就出来了：

```

function deepClone(obj) {
    var _toString = Object.prototype.toString;
    
    // null, undefined, non-object, function
    if (!obj || typeof obj !== 'object') {
        return obj;
    }


    var result = Array.isArray(obj) ? [] : 
        obj.constructor ? new obj.constructor() : {};

    for (var key in obj ) {
        result[key] = deepClone(obj[key]);
    }

    return result;
}
```

这是一个比较通用的deepclone函数了，主要思路就是先把5中基本类型处理掉（直接赋值），然后根据引用类型的类别（数组还是对象）进行递归调用，然而还有一些特殊的引用类型，这个函数是无法解决的，但大家似乎任务这并不是深度克隆需要注意的地方。我曾经看到过一些对特殊引用类型deepclone处理方法：

```

    // DOM Node
    if (obj.nodeType && 'cloneNode' in obj) {
        return obj.cloneNode(true);
    }

    // Date
    if (_toString.call(obj) === '[object Date]') {
        return new Date(obj.getTime());
    }

    // RegExp
    if (_toString.call(obj) === '[object RegExp]') {
        var flags = [];
        if (obj.global) { flags.push('g'); }
        if (obj.multiline) { flags.push('m'); }
        if (obj.ignoreCase) { flags.push('i'); }

        return new RegExp(obj.source, flags.join(''));
    }
```
嗯就酱~