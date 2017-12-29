title: JS生成一个种子随机数（伪随机数）
date: 2016-09-12 18:18:06
categories: 前端
tags: [JavaScript]
---
最近有一个需求，需要生成一个随机数，但是又不能完全随机，就是说需要一个种子seed，seed不变的时候，这个随机数就不变，根据不同的seed会生成不同的随机数= =反正就是一个伪随机数。自己想了好久也没有太好的办法，于是上网查了一下，还真有这么个东西~~
<!--more-->
嗯就长这样，知乎链接在这里：[https://www.zhihu.com/question/22818104](https://www.zhihu.com/question/22818104)

```js
function rnd( seed ){
    seed = ( seed * 9301 + 49297 ) % 233280; //为何使用这三个数?
    return seed / ( 233280.0 );
};

function rand(number){
    today = new Date(); 
    seed = today.getTime();
    return Math.ceil( rnd( seed ) * number );
};

myNum=(rand(5));
```
他这个注释也写了，为啥是这三个数	🤣，当然后面也有一些很牛逼的讨论。。。不过我完全看不懂比如什么线性同余生成器啊，什么Hull-Dobell定理啊，反正用这三个数确实能生成一个依赖于seed的伪随机数。嗯就酱。暂且记录一下这个吧，以后说不定还会用到🤣。