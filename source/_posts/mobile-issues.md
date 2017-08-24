title: 那些移动端web踩过的坑
date: 2017-08-24 15:43:38
categories: JavaScript
tags: [JavaScript,mobile]
---
扔了N久，还是捡回来了。好好弄一下吧。刚工作的时候挺忙的，后来不那么忙了，但是变懒了。
这一年大多数时间都在在做移动端的东东，做了之后才发现，同样是web前端，移动端的坑真的是深不可测，各种各样的，只有想不到，没有遇不到。在这里把最近踩过的坑整理一下。
<!--more-->
### No.1 大字体问题
首先，要解决的关键问题是如何为设备选择可视视口尺寸，采用理想视口尺寸作为可视视口尺寸，代码也十分简单，只需要将缩放比定为 1

```html
<meta name="viewport" content="initial-scale=1,maximum-scale=1, minimum-scale=1">

```
之所以把它放在第一个也是因为这个印象最深，记得第一次做移动端html5页面的时候，啥都不懂，还在用px作为像素单位，当然这个px是相对的（关于px可参考[css 长度单位知多少](https://lscho.com/tech/css_company.html)），然而在移动端使用px是相当不靠谱的，随随便便换一个大小不一样的设备，可能就会出现样式错乱。。。当然后来使用了rem，众所周知1rem=1 htmlFontSize,所以这里只要我们把html的字体大小事先定好，就可以基本上解决字体的适配问题。那么怎么选择这个htmlFontSize呢？
一般UI的设计稿都是3倍大小，这里已1080为例子（我拿到的一般都是1080的），实际上就是360px宽度的device，比如我自己习惯上想让1rem=100px(这里的px是实际像素，相当于设计稿的300像素)，那么问题关键就在于，htmlFontSize的多少px正好对应设计稿的300px，那么根元素html的fontsize（设为fz）与设备实际宽度(设为dw)的对应关系应为：

```
dw/1080 = fz/300
fz = dw/3.6
```
这样，你的设备宽度用rem表示其实就是3.6rem，即使不是360px，也可以按比例来缩放，而设计稿中的每300px对应为1rem，使用rem布局，字体大小就可以随着设备宽度来自己调整。

```js
function setRootFontSize() {
  var r = document.documentElement;
  var dw = r.getBoundingClientRect().width;
  var fz = ~~( dw <= 720 ? dw : 720 ) / 3.6;
  r.style.fontSize = fz + "px";
}
window.addEventListener("resize",setRootFontSize);
setRootFontSize();
```
这段代码基本上可以满足字体在移动端的自适应要求，可是如果用户主动把设备字体调大，也就是1px对应的大小变大，字体虽然px数不变，显示还是会变大，而有些比较复杂的h5页面字体稍微有些变化就会有问题，所以有时候还需要限定页面的字体大小不随设备字体的调整而影响，这时需要用到getComputedStyle这个方法，getComputedStyle是一个可以获取当前元素所有最终使用的CSS属性值（可参考[获取元素CSS值之getComputedStyle方法熟悉](http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle/)）。通过对比算出来的fz和实际的realfz，对其进行相应缩放即可。

```js
function setRootFontSize() {
  var r = document.documentElement;
  var dw = r.getBoundingClientRect().width;
  var fz = ~~( dw <= 720 ? dw : 720 ) / 3.6;
  r.style.fontSize = fz + "px";
  var realfz = ~~(+window.getComputedStyle(document.getElementsByTagName("html")[0]).fontSize.replace('px','') * 10000) / 10000;
  if(fz !== realfz){ r.style.fontSize = fz *(fz / realfz) + "px" }
}
window.addEventListener("resize",setRootFontSize);
setRootFontSize();
```

### No.2 滚动时最底层（或顶层）回弹问题
这个坑应该做过移动端的都踩过（只是大多数情况根本不算坑，然而我要做的东西基本上都要禁掉这玩意），试过很多方法，都不是很理想，最终的解决方案就是禁用父级元素的滚动，手动模拟滚动条：

```js
  var scroll = function(container, childSelector, style) {
    if (!container || !container.length) return;
    if (!(container instanceof $)) {
      container = $(container);
    }
    if (container.css('position') === 'static') {
      container.css('position', 'relative');
    }
   
    var child = container.find(childSelector);
    child.css({
      'transform': 'translate3d(0px, 0px, 0px)',
      '-webkit-transform': 'translate3d(0px, 0px, 0px)'
    });
    var childTop = 0; //距离容器顶部的距离 
    var conHeight = container.height(); //容器高度
    var childHeight = child.height(); //子容器高度
    var diffHeight = conHeight - childHeight; //父子容器高度差
    var clientY = 0; //手指在当前对象上触摸时的坐标
    //添加滚动条
    var defaultStyle = {
      width: '6px',
      position: 'absolute',
      'border-radius': '10000px',
      'background-color': 'rgba(0, 0, 0, 0.3)',
      'pointer-events': 'none',
    };
    $.extend(defaultStyle, style);
    if (!defaultStyle.height) {
      if (diffHeight < 0) {
        defaultStyle.height = conHeight/childHeight * (conHeight);
      } else {
        defaultStyle.height = '0px';
      }
    }
    if (!defaultStyle.top && !defaultStyle.right && !defaultStyle.bottom && !defaultStyle.left) {
      defaultStyle.top = 0;
      defaultStyle.right = 0;
    }
    var scrollBar = $('<section class="scroll-bar ui-scroll-bar"><section>');
    scrollBar.css(defaultStyle);
    container.find('.scroll-bar').remove();
    container.append(scrollBar);


    //绑定前先移除事件
    container.off('touchstart');
    container.off('touchmove');
    container.on('touchstart', function(e) {
      e.preventDefault();
      childTop = child.position().top;
      clientY = e.targetTouches[0].clientY;
    });

    container.on('touchmove', function(e) {
      if (diffHeight > 0) return;
      var curClientY = e.targetTouches[0].clientY;
      var tempTop = childTop + (curClientY - clientY);
      if (tempTop <= diffHeight) {
        tempTop = diffHeight;
      }
      if (tempTop >= 0) {
        tempTop = 0;
      } 
      child.css({
        'transform': 'translate3d(0px, ' + tempTop + 'px, 0px)',
        '-webkit-transform': 'translate3d(0px, ' + tempTop + 'px, 0px)'
      });
      scrollBar.css({
        'transform': 'translate3d(0px, ' + (-tempTop* (conHeight/childHeight)) + 'px, 0px)',
        '-webkit-transform': 'translate3d(0px, ' + (-tempTop* (conHeight/childHeight)) + 'px, 0px)'
      })
    });
  }
  scroll($('.parent'), '.child')
```
原理其实还是很简单，先计算一下滚动条的高度，然后按照比例去设置transform（还有很多可优化扩展的地方），第一个参数是父元素的zepto（或jquery）选择器对象,第二个参数是需要滚动的子元素包裹层，第三个是滚动条的样式（可选，有默认），需要把parent元素设置为overflow：hidden，child元素的height设置为auto。

### No.3 Modal弹出层滚动带动底层一起滚动
这个也是只有移动端才有的坑，类似与一种穿透吧，手指在弹出层滑动的同时，如果底层有滚动条的话也会跟着一起滑动,解决方案:
css添加：

```css
/*禁止modal底层滚动*/
body.dialog-open {
  position: fixed;
  width: 100%;
}
```
js添加

```js
var SCROLL_TOP = 0;
/*禁止modal带动底部滚动*/
function to(scrollTop){
  document.body.scrollTop = document.documentElement.scrollTop = scrollTop;
}
function getScrollTop(){
  return document.body.scrollTop || document.documentElement.scrollTop;
}
/*modal弹出时使用*/
SCROLL_TOP = getScrollTop();
document.body.classList.add('dialog-open'); 
document.body.style.top = -SCROLL_TOP + 'px';
/*modal关闭时使用*/
to(SCROLL_TOP);
```

### No.4 tap事件穿透
这算是zepto的一个bug了，具体这个bug的源头还得追到zepto对于tap事件的模拟（参考[也来说说touch事件与点击穿透问题](https://segmentfault.com/a/1190000003848737)），我后来用的解决方法也是参考这里来的，就是使用pointer-events这个属性，这里就不多介绍了,这里的第三种方法，使用[fastclick](https://github.com/ftlabs/fastclick)库模拟click也可以完美解决移动端的点穿问题。

```js
$('#closePopup').on('tap', function(e){
    $('#popupLayer').hide();
    $('#bgMask').hide();

    $('#underLayer').css('pointer-events', 'none');

    setTimeout(function(){
        $('#underLayer').css('pointer-events', 'auto');
    }, 400);
});
```

#### 参考链接
- [获取元素CSS值之getComputedStyle方法熟悉](http://www.zhangxinxu.com/wordpress/2012/05/getcomputedstyle-js-getpropertyvalue-currentstyle/)
- [css 长度单位知多少](https://lscho.com/tech/css_company.html)
- [网易和淘宝移动WEB适配方案再分析](https://zhuanlan.zhihu.com/p/25216275)
- [也来说说touch事件与点击穿透问题](https://segmentfault.com/a/1190000003848737)
- [前端涉及的各种像素概念以及 viewport 汇总](https://github.com/hijiangtao/hijiangtao.github.io/blob/master/_posts/2017-07-08-Device-Viewport-and-Pixel-Introduction.md)