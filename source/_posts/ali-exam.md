title: "一些阿里校招笔试题"
date: 2015-08-19 22:17:20
categories: 整理
tags: [JavaScript,CSS]
---
昨天做了阿里的笔试题，总体感觉说来，比之前实习那个简单多了- -我记着那次各种跨度各种大，考了node，canvas，web安全，AMD和CommonJS等balabalabalalalal咳咳咳这次的笔试题更加注重基础了，整体来讲没啥问题，然而有些题也不是很确定。不扯废话了，把记录下来的几个觉得值得记录的题弄上来分析下：
<!--more-->
填空和选择都是一些基础题目，大题也没有脱离JS,CSS,HTML的基础。
###### 1
```
var matrix = {[1,2],[3,4],[5,6]};
  var flatten = matrix._____(function(a,b){
    _______
  });
  console.log(flatten());//[1,2,3,4,5,6]
```

这个题第一感觉想到用map，然而仔细一看其实是一个归并操作，将matrix种所有的数组元素合并成一个大数组，所以应该是对数组进行归并然后连接，所以我的答案是：reduce，return a.concat(b)。

###### 2
```
 var func = function() {
    console.log(this.valueOf());
  }
  func._____________
  期望结果：abc
```

这个题挺有意思的感觉，因为func函数中没有abc字符串，而空格中明显是要调用func函数的一个方法（或者属性），然而函数本身的属性没有什么会是abc的，最开始我想到重新定义函数本身的valueOf，然而并不可取，在func内部的this明显是指向window对象，就算你定义func的什么东西，func内部的this就是window，后来想想这就1个空，怎么说也就是一个方法的事情，那函数本身就那么几个方法，而这道题明显是让你自己用abc通过valueOf输出出来，那么只要使用call或者apply就可以搞定了。我的答案：call("abc")或者apply("abc"),这两个函数再只有一个参数的时候没什么区别的。

###### 3
实现左右布局，左边固定200px，右边自适应宽度。使用多种方法。
<iframe height='288' scrolling='no' src='//codepen.io/geniuspeng/embed/JdQKyy/?height=268&theme-id=15655&default-tab=result' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'>See the Pen <a href='http://codepen.io/geniuspeng/pen/JdQKyy/'>左右布局</a> by Yunpeng Bai (<a href='http://codepen.io/geniuspeng'>@geniuspeng</a>) on <a href='http://codepen.io'>CodePen</a>.
</iframe>
我就写了这三种，一种是float的流式布局，一种是绝对定位实现的，一种是flex伸缩盒布局，写到这里不得不感慨一句：FLEX大法好！ 咳咳。
###### 4
使用原生JS，写一个getElementsByName（root,class_name）方法，获取指定元素（root）所有包含类（class_name）的子元素，需要兼容IE6，7浏览器。
```
 function getElementByClassName(root,class_name)
{
    if(root)
    {
        root=typeof root=="string"?document.getElementById(root):root;
    }else
    {
        root=document.body;
    }
    //class_name=tag||"*";
    var els=root.getElementsByTagName("*"),arr=[];
    for(var i= 0,n=els.length;i<n;i++)
    {
        for(var j= 0,k=els[i].className.split(" "),l= k.length;j<l;j++)
        {
            if(k[j] ==class_name)
            {
                arr.push(els[i]);
                break;
            }
        }
    }
    return arr;
}
```
###### 5
请用JavaScript实现一个输入框，可根据用户的输入，来实时像服务器请求，并给出搜索结果，主要功能点要求，要考虑一些性能优化。
```
<!DOCTYPE html>
<html>
<head>
    <script type="text/javascript">
        // Firefox, Google Chrome, Opera, Safari, Internet Explorer from version 9
        var timeout = null;
        function OnInput (event) {
            if(timeout) {
                clearTimeout(timeout);
                timeout = null;
                timeout = setTimeout(function(){
                    var xhr = createXMLHTTPRequest();
                    alert("send ajax");
                }, 200);
            } else {
                timeout = setTimeout(function(){
                    var xhr = createXMLHTTPRequest();
                    alert("send ajax");
                }, 200);
            }
        }
        // Internet Explorer
        function OnPropChanged (event) {
            if (event.propertyName.toLowerCase () == "value") {
                if(timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                    timeout = setTimeout(function(){
                        var xhr = createXMLHTTPRequest();
                        alert("send ajax");
                    }, 200);
                } else {
                    timeout = setTimeout(function(){
                        var xhr = createXMLHTTPRequest();
                        alert("send ajax");
                    }, 200);
                }
            }
        }
        // XHR
        function createXMLHTTPRequest() {
            var xmlHttpRequest;
            if (window.XMLHttpRequest) {
                //针对FireFox，Mozillar，Opera，Safari，IE7，IE8
                xmlHttpRequest = new XMLHttpRequest();
                if (xmlHttpRequest.overrideMimeType) {
                    xmlHttpRequest.overrideMimeType("text/xml");
                }
            } else if (window.ActiveXObject) {
                var activexName = [ "MSXML2.XMLHTTP", "Microsoft.XMLHTTP" ];
                for ( var i = 0; i < activexName.length; i++) {
                    try {
                        xmlHttpRequest = new ActiveXObject(activexName[i]);
                        if(xmlHttpRequest){
                            break;
                        }
                    } catch (e) {
                    }
                }
            }
            return xmlHttpRequest;
        }
    </script>
</head>
<body>
<input type="text" oninput="OnInput (event)" onpropertychange="OnPropChanged (event)"
       value="Text field" />
</body>
</html>
```