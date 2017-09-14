title: "浅谈flexbox--伸缩盒模型"
date: 2015-06-02 21:22:47
categories: css
tags: [css3,flexbox]
---
最近在研究垂直居中的时候发现了flexbox这货，以前也知道它是个css3的新特性，但具体也不知道是干嘛的，这几天就仔细研究了下。。。感觉这货真是个逆天的存在啊O O
Flexbox是spankin新推出的一种CSS布局模块，拥有完美的浏览器兼容性！它可以轻易做到垂直居中、重新排序、布局的动态伸展与收缩。首先放3个应该会有用的链接：
- [兼容性参考](http://caniuse.com/#feat=flexbox)
- [中文基本教程](http://www.w3.org/html/ig/zh/wiki/Css3-flexbox/zh-hans)
- [flex快速布局神器](http://www.w3cplus.com/css3/flexbox-basics.html)
<!--more-->
***
然后，在使用flexbox布局的时候，必须创建一个flex容器，很简单只需要将display的值设置成flex即可，某些相应内核的浏览器要加上对应前缀：
```
.flexcontainer {
   display: -webkit-flex;
   display: -moz-flex;
   display: flex;
}
```
设置了flex容器后，在其内部的元素就是flex项目了。
那么，下面就展示下这货可以做的事情:
##首先：当然是垂直/水平居中
话说，总算有个比较简单的居中方法了，虽然之前也有不少，不过还是感觉这个好接受啊！只需要父元素设置个高度，然后margin设置一下auto就ok了。
具体研究的话，主轴对齐flex项目justify-content，侧轴对齐flex项目align-items以及堆栈伸缩行align-content这几个属性可以实现更加高级的各种居中，对齐等布局方式
<script src='http://runjs.cn/gist/p3t2gp33/css/midnight'></script>

## flex等分布局
flex项目有一个flex的属性，它可以控制flex项目的伸缩性，它的3个值[ <'flex-grow'> <'flex-shrink'> <'flex-basis'> ]分别表示扩展比率，收缩比率，以及收缩基准值。详细解释在那个有用的链接里有~~
简单来说，如果设置一个值，也就是设置flex-grow，其他两个都是默认的（flex-shrink=1，flex-basis=0px），它将代表这个flex项目的比例。就是说如果想实现等分，只需要将所有的项目flex设置为1
<script src='http://runjs.cn/gist/runx25sp/css/rdark'></script>

## flex不等分布局
同样是设置flex的值，这里有一些特殊的值比如[flex: initial]，[flex: 0 auto]代表初始值[flex: 0 1 auto],而[flex: auto]代表默认值[flex: 1 1 auto]，[flex: none]代表[flex: 0 0 auto]
<script src='http://runjs.cn/gist/3awjriff/css/rdark'></script>
刚刚入门，只是了解了一些简单的例子，不过我已经可以感受到flexbox的强大了O O，[这里有更多的栗子- -](https://css-tricks.com/snippets/css/a-guide-to-flexbox/).