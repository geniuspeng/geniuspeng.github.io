title: "kata_uniqueinorder"
date: 2015-06-27 14:07:48
categories: JavaScript
tags: JavaScript
---
据说7，8月就进入校招内推阶段，而9月就开始进行大规模校招了。。。最近开始刷题，目的就是熟练JS。。。正好把一些自己觉得不错的题（主要应该是解法）记录下来~~
废话不说了直接上题：
<!--more-->

######
Description:

Implement the function unique_in_order which takes as argument a sequence and returns a list of items without any elements with the same value next to each other and preserving the original order of elements.

For example:
``` bash
uniqueInOrder('AAAABBBCCDAABBB') == ['A', 'B', 'C', 'D', 'A', 'B']
uniqueInOrder('ABBCcAD')         == ['A', 'B', 'C', 'c', 'A', 'D']
uniqueInOrder([1,2,2,3,3])       == [1,2,3]
```
######

题目要求很简单，一个字符串或者数组，去重。。。但不是常规的去重，只是去掉相邻元素中重复的变成一个，然后返回去重后的数组。。。思路也很简单其实，新建一个结果数组，然后就是遍历一下，看后一个是否与前一个相同，如果不同就push进去直到结束。。。
当然我就是这么想的，而且结果也通过了，不过要针对字符串和数组区分一下，然后就是要注意一下，如果输入的是一个空字符串或者空数组，就直接返回一个空数组。。。当然我写在这里不是为了记录这些的，自己写的也就不粘上来献丑了。。。
记录一些大神们的写法：
### 1
```
var uniqueInOrder = function (iterable)
{
  return [].filter.call(iterable, (function (a, i) { return iterable[i - 1] !== a }));
}
```
直接让参数调用数组的filter方法，这个方法会针对当前数组的每一项执行它参数的callback函数，返回这个callback函数的结果为true的数组。

### 2
```
function uniqueInOrder(it) {
  var result = []
  var last
  
  for (var i = 0; i < it.length; i++) {
    if (it[i] !== last) {
      result.push(last = it[i])
    }
  }
  
  return result
}
```
这个跟我的思路很像了，不过用了一个last来存取上一个变量，而且用[]加下标是可以针对字符串使用的，所以说少了一些不必要的判断。

### 3
```
var uniqueInOrder=function(iterable){
 
  iterable = (Array.isArray(iterable)) ? iterable : iterable.split('')
  return iterable.filter(function(val,i,a) {return val != a[i+1] })

}
```
原理同1...

### 4
```
var uniqueInOrder=function(iterable) {
  var input = iterable.replace ? iterable : iterable.join('');
  var type = typeof iterable[0] === "number" ? Number : String;
  return input.replace(/(\w)\1*/g,"$1").split('').map(type);
}
```
总是会有大神喜欢用正则表达式来解决问题，这个自己参悟吧，其实懂了正则就很好理解，不过对于我这种菜鸟来说很难想出来这个思路。。。囧