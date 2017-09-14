title: "那些年我们用CSS画的图形"
date: 2015-07-19 16:46:48
categories: css
tags: [css,css3]
---
想当年，CSS刚出生的时候还无法得到大家的认可，那时候这货还是一个不符合标准的东东。。。然而从1996年W3C正式推出了CSS1开始到现在还在发展的CSS3，这货的强大功能可谓家喻户晓，包括之前只能用JS实现的动画效果，现在可以用纯CSS来搞定。最近记录了些CSS的图形实现，前一阵子面试还被问到如何用CSS实现三角形的问题。。。之前在css-trick上看多过很多图形，在此记录下
<!--more-->
### 正方形/矩形
这个没啥好说的，设置宽高即可。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/NqBONa/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/NqBONa/'>NqBONa</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

### 圆形/椭圆
这个也没啥好说的，CSS3的圆角属性搞定。。。这里属性值可以用百分比来表示，50%即为一个圆形。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/ZGjqLq/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/ZGjqLq/'>CSS圆形/椭圆</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

### 三角形
三角形最普遍的方法就是用border来实现的，当一个div内容的宽高为0时，它的border就会呈现一个三角形的形状。通过设置border的大小和有无可以控制三角形的形状。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/PqByjm/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/PqByjm/'>CSS三角形</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>
