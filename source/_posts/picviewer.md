title: "简单的图片查看器（缩放和拖动）"
date: 2015-05-16 15:53:27
categories: 综合
tags: JavaScript
---
最近参加了360的一个校招，然后留了这么个作业
![img](http://7xj4f4.com1.z0.glb.clouddn.com/360homework.png)
作为一只前端菜鸟，我的第一反应是：啊 写个简历吧，反正以后找工作也能用上...然后我就写。 。 。 我就写。 。 。 然后发现问题了：
<!--more-->
1. 这尼玛，网页上做简历跟在word上做能做出啥区别来么？交互又是什么GUI？再怎么做不都是把文字直接往里贴么。。。而且我还是用markdown写的，完全木有技术含量啊。。。会打字的都能做出来~这是我忽然想到了以前看过的一个学长的主页，用了一个看似很炫酷的东西做的关于自我简介的力学图。。。于是问了下群里的大神，告诉我用D3做的，感觉这个是个交互的东西而且感觉逼格挺高的呵，于是乎上网查了下······这尼玛这API给我几个月也记不全，好在我只想用一部分，就把力学图那里简单学了下，折腾2个晚上总算是做出来个东西，但是做出来之后感觉放到我用markdown写的那个简历（就是主页的about页面）里太特么不合群了（凭啥我们都不会动就你会动，凭啥就你能交互- -），所以就没扔进去，放在博客的[Home主页](http://locusland.xyz/)了- -
2. 由于本科水过来的，硕士还是水过来的，简历上确实写不出神马好东西来，无非也就是吹吹NB败败火只当看个乐呵···还是做个图片查看器那个好了。。。
要说这个要求，一个缩放，一个拖拽，我印象中用jQuery的话，几行代码松松搞定的。。。不过毕竟是个菜鸟，用jQuery想必还不如不做，对自己也没什么提高，还是要注重基础，基础嗯。。。所以得用原生的JS做，顺便熟悉一下那些事件。


##关于缩放
这个没啥好说的，一般都是2个按钮，一个放大一个缩小，直接控制图片的`height`和`width`属性就可以了，或者用zoom属性来控制，点一下大一些或者小一些(不要问为神马用1.2)，咳咳咳。。。
```
function larger(){//两种方式，可以用width和height，也可以用zoom来控制
    var w = image.width;
    var h = image.height;
    image.width = w * 1.2;
    image.height = h * 1.2;
    // image.style.zoom = parseFloat(image.style.zoom) + 0.1;
}
function smaller(){//同larger
    var w = image.width;
    var h = image.height;
    image.width = w / 1.2;
    image.height = h / 1.2;
    // image.style.zoom = parseFloat(image.style.zoom) - 0.1;
    // if(image.style.zoom < 0.1) return
}
```
然后一般都会带个滚轮来缩放吧，就是onmousewheel这个事件和wheelDelta这个属性来控制图片大小的问题，也是两种形式（宽高或者zoom属性），反正我是这么写的(据说FireFox浏览器木有wheelDelta这个属性，而是detail，关于浏览器兼容这些，就当外部已经处理好了吧，不要在意这些细节)
```
image.onmousewheel = function(e){ //也是两种方式
    e = e || window.event; 
    var w = image.width;
    var h = image.height;
    image.width = e.wheelDelta>0 ? w * 1.2 : w / 1.2;
    image.height = e.wheelDelta>0 ? h * 1.2 : h / 1.2;
    // zoom = parseFloat(this.style.zoom);
    // curZoom = zoom + (e.wheelDelta>0 ? 0.05 : -0.05);	
    // if(curZoom < 0.1) return
    // this.style.zoom=curZoom;
    // return;
    }
```
##关于拖动
拖动的功能，在以前做项目的时候就遇到过，不过都是网上搜的代码直接用的，不过仔细分析一下原理，也不是很复杂，尤其是单纯滴拖个图片放到另一个位置，那更简单了
好吧做这个功能还真发现了奇怪的东西，就是说如果你的图片的`top`和`left`属性是通过外部css引入的，或者是style标签引入的，在js里直接要获取，它会很傲娇，不给你值，当然一般情况不会把一张图片摆在那进行操作（那时候你可以new Image（）嘛），我这只是个简单的图片的查看器，所以就简单起来了
```
<div id="div" style="position:absolute;top: 50px;left: 0px;">
	<img draggable="true" style="zoom: 1.0;position: absolute;top: 50px;left: 50px;cursor:move;visibility:visible" id="image" src="http://7xj4f4.com1.z0.glb.clouddn.com/test.jpg" alt="大家好我是测试图片">
</div>
```
简单的情况自然有简单的处理方法，直接加style属性，这样就可以直接获取他的top和left属性了。至于我为什么要加一个div，其实一开始直接用图片image来定位的，但是做出来之后，缩小之后的图片进行拖拽的时候，鼠标移动速度要比图片移动速度快，造成不同步了，而正常情况下图片也都不是单独存在的，这里就用div的style来进行图片的定位。
而拖动的原理就是。。。。。。简单的定位
#####如果不用HTML5
那就是onmousedown，onmousemove，onmouseup这几个事件配合一下了，弄个`flag=false`代表是否可拖动(初始为不可拖动状态)：
**onmousedown**：初始化一下，让`flag=true`，然后记录下此时的图片的top和left值，同时记录下此时的clientX和clientY（就是鼠标位置距离浏览器上边喝左边的距离，不算滚动条，我这里记为left_before和top_before）
**onmousemove**：动态改变图片的top和left，怎么改变呢...首先要随时获取当前的clientX和clientY，减去初始化时获取的clientX和clientY（就是left_before和top_before），其实就是鼠标拖动的水平和垂直距离，再加上初始化时候的left和top，就是当前的left和top...还是很好理解的，这里在移动过程中要随时return，否则它拖一小段距离就罢工了
**onmouseup**：拖动结束鼠标松开的时候触发，需要做的只是把flag设置为false，让其变回不可拖动状态
```
image.onmousedown = function(e) {
    e = e || window.event;
    drag_flag = true;
    left_init = parseInt(div.style.left);
    top_init = parseInt(div.style.top);
    console.log(left_init);
    left_before = e.clientX;
    top_before = e.clientY;
} 
image.onmousemove =  function(e) {
    e = e || window.event;
    if(drag_flag){
        div.style.top  =  (e.clientY - top_before + top_init)+"px";
        div.style.left = (e.clientX - left_before + left_init) +"px";
        return false;
    }	
} 
image.onmouseup = function(e) {
    e = e || window.event;
    drag_flag = false;
} 
```
#####如果用HTML5
其实H5有个drag，专门处理拖动的，不过对于这种简单的图片拖动，其实是没有什么区别的，在这里，我要无耻地盗一张图
![img](http://7xj4f4.com1.z0.glb.clouddn.com/h5drag.png)
看完这个，其实相对于之前mouse的3个事件，对应的是dragstart,dragover,drop三个事件，不过要注意下，首先要先设置个`draggable="true"`,然后dragover和drop都是针对目标对象的，不是图片本身，而是图片落下的那个地方，其实在我这里就是body了,那么就可以这样写：
```
image.ondragstart = function(e) {
    e = e || window.event;
    drag_flag = true;
    left_init = parseInt(div.style.left);
    top_init = parseInt(div.style.top);
    console.log(left_init);
    left_before = e.clientX;
    top_before = e.clientY;
} 
document.ondrop = function(e) {
    e = e || window.event;
    drag_flag = false;
}
document.ondragover = function(e) {
    e = e || window.event;
    if(drag_flag){
        div.style.top  =  (e.clientY - top_before + top_init)+"px";
        div.style.left = (e.clientX - left_before + left_init) +"px";
        return;
    }
}
```

其实，H5的这个drag用在这里感觉挺浪费的，因为感觉做不出什么区别来- -拖拽的一些其他复杂实现感觉用这个比mouse事件要来得方便得多~~~
关于图片处理，CSS还可以实现平移，旋转，翻转，以及各种滤镜。。。不过题目也没要求，而且只是为了感悟下拖动的原理，所以就酱吧
虽然是很简单的东西，不过要想原生实现，其实还是会发现很多问题的，而且我这里没有考虑太多了浏览器兼容问题，都说了只是为了感悟一下拖动的原理= =还是，基础，要基础啊，前辈们说滴还是很有道理的，用别人的东西用10次也不如自己写一次！