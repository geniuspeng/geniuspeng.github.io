title: "那些年我们用CSS画的图形2"
date: 2015-08-12 19:37:03
categories: css
tags: [css,css3]
---

休了个半个月的“长假”，我觉得这算是我在最近几年的夏天能休的最长的假了。放假前那个关于图形的只写了一半- -赶紧补上。之前都是一些简单的图形，现在的CSS3结合：before和：after伪类只用少量代码就可以完成一些更复杂的图形：
<!--more-->

###梯形/平行四边形
先说说梯形吧，其实跟画三角形的原理类似，利用border的厚度来实现的，我们可以想象，一个div他的上下border和左右border分别占据它height和width的一半的时候，这四个border就会展现成四个三角形占据了整个div，当然，如果这个border的厚度没有达到那么多，那四个border会展示成4个等腰梯形。
平行四边形的话，是利用css3的transform属性来实现的，transform有一个skew的值，定义图形沿着 X 和 Y 轴的 2D 倾斜转换，也可以指定skewX或者skewY来指定是X轴还是Y轴，不管怎么做，利用这一个属性即可实现平行四边形。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/gpyaQp/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/gpyaQp/'>CSS3梯形/平行四边形</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

###五角星/六角星
这个五角星相比之前的图形略显复杂，至少对我我现在的CSS水平独立画出来应该是有一些费劲~~~然而只要知道原理，还是很好实现的，这个五角星实际上是用三个三角形拼出来的图形，这三个图形则通过before和after伪类来实现，三角形仍然是利用border方法，两个分别向两边旋转35度的矩形，加上一个竖直的矩形分离出来的三个三角形即可实现，然而要设计一下矩形的长宽来确保组成五角星的三角形所需要的角度。
六角星的话相对来说就简单些了，实际上是用两个等边三角形组成的，一个正立的一个倒立的，再进行适当的移位即可完成，如果话正六边形，那等边三角形的设计需要注意div矩形的长宽以及border的厚度。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/QbPjov/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/QbPjov/'>CSS五角星/六角星</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>

###正五边形/正六边形/正八边形
其实只要有三角形和梯形，这些形状都可以说是轻而易举，最主要的问题是找好三角形或者梯形的角度。正五边形，一个三角形加一个倒梯形，正六边形，则是上下两个三角形和中间一个矩形组成的，而正八边形则是上下两个梯形加上中间一个矩形组成。
<iframe height='268' scrolling='no' src='//codepen.io/geniuspeng/embed/LVvGYo/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/LVvGYo/'>CSS正五边形/正六边形/正八边形</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>