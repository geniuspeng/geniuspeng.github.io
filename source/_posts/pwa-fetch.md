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
嗯这里主要讲fetch。其实说到底，fetch API和PWA关系并不是很大(但还是要了解这个东东)，而且Fetch API并不是为了PWA而生的，确切的说，我倒是觉得这货是为了取代Ajax的XMLHttpRequest而生的。