title: 实现transition变换height为auto
date: 2017-03-09 20:41:37
categories: 前端
tags: [CSS, 动画]
---

我们都知道transition可以指定特定的变换加一个过渡效果，它依赖于transition-property的这个属性，比如我们可以让一个蒙层的width在0和100%之间变换，同时加入transition，可以轻松完成一个滑动的效果，但在height上如果想实现一个类似的效果，就会有一些问题。
<!--more-->
css3 transition动画的一些限制，那就是transition-property的起始值必须为具体数值或数值百分比，反正就是说得有个具体的数字，一旦你这个东西高度不确定，使用auto的话，transition便不会生效。一个比较简单的解决方法就是使用max-height。

```css
ul.menu li .sub{  
    max-height: 0;  
    overflow: hidden;  
    transition: max-height 1s;  
}  
ul.menu li:hover .sub{  
    max-height: 200px;  
}  
```

需要注意的一点就是：需要确保max-height的值超过所有项中的最大值，确保一定要罩得住里面的内容。