title: "kata_duplicates"
date: 2015-06-28 21:26:36
categories: JavaScript
tags: JavaScript
---
继续刷题ING。。。
Description:

Given an array, find the duplicates in that array, and return a new array of those duplicates.

Note: numbers and their corresponding string representations should not be treated as duplicates (i.e., '1' !== 1).

很简单的一道题，给定一个数组，返回数组中的duplicates，也就是在这个数组中出现次数大于1的元素组成的数组。。。思路就是像数组去重那样遍历数组，但数组去重遇到之前存在的元素就跳过去，这里需要把这个元素放到结果中，而且以后再遇到这个元素就不做处理了。就是说返回的结果中不能有重复元素~思路就这样，但我发现同样的思路，我和大神们的写法居然差了这么多 - -果然还是不熟练啊
<!--more-->
我的写法：
```
function duplicates(arr) {
		  //TODO: return the array of duplicates from arr
		  var result = [];
		  var temp = [];
		  for(var i=0;i<arr.length;i++){
		    if(temp.indexOf(arr[i])<0) temp.push(arr[i]);
		    else if(result.indexOf(arr[i])<0) result.push(arr[i]);
		  }
		  return result;
		}
```
大神写法：
###1
```
function duplicates(arr) {
  for (var dup = [], i = 0; i < arr.length; i++) {
    var n = arr[i]
    if (arr.indexOf(n, i + 1) >= 0 && dup.indexOf(n) < 0) {
      dup.push(n)
    }
  } 
  return dup
}
```
###2
```
function duplicates(arr) {
  return arr.filter(function(v, i) {return arr.indexOf(v) != i && arr.lastIndexOf(v) == i;});
}
```
###3
```
function duplicates(arr){
  return arr.reduce(function(a, v, i){
    return (arr.indexOf(v) != i && a.indexOf(v) == -1) ? a.concat(v) : a;
  }, []);
}
```
###4
```
function duplicates(arr) {
  var output = [];
  for (var i = 0; i < arr.length; i++) {
    if (arr.slice(i+1).indexOf(arr[i]) > -1 && output.indexOf(arr[i]) < 0) output.push(arr[i]);
  }
  return output;
}
```
其实思路都是一样的，不过仔细想想，在很多情况下，数组那几个迭代方法在处理数组的时候要比for要来得方便得多，所以说还得慢慢熟练啊。。。
