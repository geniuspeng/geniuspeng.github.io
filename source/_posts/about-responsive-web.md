title: "浅谈web响应式设计"
date: 2015-05-08 20:28:55
categories: 网站设计
tags:
- 响应式
---

我是从今年年初才开始接触前端的，从那时候开始就时不时地看到“响应式”这个词，倒是一直没有仔细的研究一下这个东西。。。不过这玩意貌似在前端领域是越来越火，尤其在这个移动设备逆天的年代。。。
那么，什么是“响应式”呢？为什么要进行网页的“响应式设计”呢？我没打算在这里解释。在网上和书上这些解释已经随处可见了，。如果是资深前端玩家- -应该对伊桑·马科特（Ethan Marcotte）据有开拓性的文章[A List Apart](http://alistapart.com/articles/responsive-web-design)很熟悉，当然我这种小菜鸟是不知道的- -我只是想在这里标记下这个词的来源。
你肯定不希望用锤子来吃饭或者用菜刀在墙上钉钉子，响应式也是这个道理，简单来说就是根据屏幕设备的大小来进行合适的设计。概念上的东西就不在这里浪费墨水了，下面记录下我的个人理解。
<!--more-->


## 主要三点：
- 媒体查询
    - [CSS3 Media Querys](http://www.w3cplus.com/content/css3-media-queries)
    - [响应式设计之Media Querys](http://www.cnblogs.com/mofish/archive/2012/05/23/2515218.html)
    - [学习之响应式Web设计：Media Queries和Viewports](http://blog.jobbole.com/18179/)
- 流体布局
    - [CSS流体(自适应)布局下宽度分离原则](http://www.zhangxinxu.com/wordpress/?p=1463)
- 图像，视频等的自适应
    - [响应图片(Responsive Images)技术简介](http://www.zhangxinxu.com/wordpress/?p=2204)
    - [响应式设计：响应图像](http://www.w3cplus.com/responsive/understanding-responsive-web-design-how-to-manage-images.html)
    - [[译]响应式web设计之字体响应式](http://pigerla.com/understanding-responsive-web-design/2014-02-16/understanding-responsive-web-design-how-to-manage-fonts/)
    - [Flexible Images](Flexible Images)
    
## 设计响应式的网页


1. 允许网页自动调整宽度
首先的问题是设备宽度未必就是布局宽度。比如一个设备的宽度是400px，一个网页的实际布局是1000px，那么之后的整个网页可能就会放大（或者说把网页内容缩小）以显示其全貌。这么做的目的是让非适应性布局能够在手机或者平板等移动设备中显示。然而我们需要找到一种方式来设定宽度，这样就可以使用媒体查询来进行检测。使用HTML中的元标签来完成这项任务。
viewport是网页默认的宽度和高度，这句话的意思就是说：让试图的宽度和设备的宽度一致，网页宽度默认等于屏幕宽度（width=device-width），原始缩放比例（initial-scale=1）为1.0，即网页初始大小占屏幕面积的100%。 所有主流浏览器都支持这个设置，包括IE9。对于那些老式浏览器（主要是IE6、7、8），需要使用[css3-mediaqueries.](https://code.google.com/p/css3-mediaqueries-js/)。
``` html
<meta name="viewport" content="width=device-width, initial-scale=1"/>
```

2. 不要使用绝对宽度和绝对字体
由于网页会根据屏幕宽度调整布局，所以不能使用绝对宽度的布局，也不能使用具有绝对宽度的元素。
    
3. 媒体查询 针对不同的屏幕进行详细设计
常见媒体查询（举个简单的栗子）  
``` css
/* 平板电脑布局: 481px 至 768px。样式继承自: 移动设备布局。 */
@media only screen and (min-width: 481px) {
.class{
    background: #333;
}
}
/* 桌面电脑布局: 769px 至最高 1232px。样式继承自: 移动设备布局和平板电脑布局。 */
@media only screen and (min-width: 769px) {
 .class {
    background: #666;
  }
}
```    

4. 图片自适应
我感觉这一步算是终极优化步骤了。然而，这不是什么简单的事情。拿背景图片来说，自适应可不是说简单的设置background-size：cover就可以实现的。就是说，这不仅仅是让你的图片跟着屏幕的大小而进行放大和缩小。因为对于移动设备来说，加载一张大图片是很纠结的事情（当然4G和wifi另当别论），所以目前一个比较好的办法是选择一张相对较小的图片让它在小屏幕设备上去加载。但是问题还是有的，就现在这移动设备的各种型号各种尺寸来说，如果想适应N个大小的屏幕就要使用N张图片还是很蛋疼的事情，虽然可以将就着用--
关于图片自适应，上面给了一些其他博客的分析调查研究什么的。。。其实这个东西估计在不远的将来应该会更加完美的- -就先不要操这个心了吧


## 一些其他可能有用的链接

- [什么是web响应式设计](http://blog.jobbole.com/7908/)
- [自适应网页设计](http://www.ruanyifeng.com/blog/2012/05/responsive_web_design.html)
- [25款最佳响应式前端开发框架](http://code.csdn.net/news/2819417)
