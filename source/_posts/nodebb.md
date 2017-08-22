title: "初探nodebb"
date: 2015-06-17 22:07:16
categories: 综合
tags: node
---
偶然发现了NodeBB这个东东~~~不得不承认，就目前的形势来看，node已经可以在后台独当一面了，至少我是这么认为的。。。CNode社区就足以证明这一点。这个NodeBB也是个社区搭建框架，而且看起来灰常强大，而卧搭建好之后事实证明确实如此。
废话不多说，这里我把搭建过程和其中遇到的问题都记录一下...说不定以后会用得上。

<!--more-->

好吧，首先必须承认，最开始我是打算在Windows系统上去弄这货，但是遇到各种各样奇葩的问题，后来去NodeBB的论坛上，好多人也都反应最新版本的nodebb在windows上并不是能很好的搭建，于是乎转战Ubuntu了。
###安装必备软件包
当然，系统必须有一些必备的软件包，首先还是必须要有git，然后安装一些nodebb所需的基本包：

```bash
$ sudo apt-get install git nodejs nodejs-legacy npm redis-server imagemagick build-essential
```

###安装nodejs
接下来，如果没有装node的话，需要安装一个合适版本的node，这里不一定是安装最新版本，而是一个合适的稳定版本,可以使用 ``node –version`` 来查看当前node版本，如果想要安装node.js v0.11 使用这个ppa:chris-lea/node.js-devel即可：

```bash
$ sudo add-apt-repository ppa:chris-lea/node.js
$ sudo apt-get update && sudo apt-get dist-upgrade
```

###安装mongoDB
然后，这个社区目前使用的数据库是redis或者是mongoDB，就我个人而言，对于mongoDB更熟悉一些，所以我是基于mongoDB搭建的,那么首先必须在系统中安装mongoDB：
这里上个链接吧:[ubuntu下安装mongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)

###克隆nodebb到本地
安装好数据库之后，就可以从github上把nodebb的源码clone到本地了（nodebb目前还在完善之中，我是用的这个版本，可以根据需要选择clone哪个版本，如果不加需求就是clone最新版本了）：

```bash
$ git clone -b v0.7.x https://github.com/NodeBB/NodeBB.git nodebb
```

###安装nodebb依赖模块
然后进入到目标文件夹，安装nodebb的依赖模块：

```bash
$ cd nodebb
$ npm install --production
```

在这里，最开始我是遇到了一些问题，就是node-gyp rebuild的过程巨慢无比，老是在这里卡住：[我是解决方法链接](http://www.bubuko.com/infodetail-827600.html)

###为用户建立数据库
之后需要新建一个mongoDB数据库，来存储用户数据：
首先进入mongo命令行：

```bash
$ mongo
```

创建一个名字为nodebb的数据库（如果没有名为nodebb数据库，use命令会自动创建该数据库并切换到该数据库）：

```bash
> use nodebb
```

对于mongoDB2.6.X版本（nodebb对于mongoDB的版本为2.6.0以上，密码自定）：
```bash
> db.createUser( { user: "nodebb", pwd: "<Enter in a secure password>", roles: [ "readWrite" ] } )
```

这样就在名为nodebb的数据库中建立了一个名字为nodebb的用户，具有读写权限。
接下来为了使其权限可用，需要对mongoDB进行一下小小的配置：找到/etc/mongod.conf文件，里面有一个“#auth = true”的注释，将注释“#”去掉（具体方法可以用gedit命令或者nano等），然后重启mongoDB:

```bash
# service mongod restart
```

###配置nodebb
进入nodebb目录对其进行配置

```bash
$ cd /path/to/nodebb
$ node app --setup
```

setup会让你输入一系列的东东- -一般来说，默认就好，如果你想用别的也可以改成自己的：
-首先是hostname和端口，我是默认了，可以按照自己的想法修改；
-然后是数据库，我选择mongo；
-将你的username改成nodebb，因为上面建立的那个nodebb的用户，或者在上面设置一个其他的名字，这里就填那个；
-将之前步骤的密码填到密码这里；
-数据库的名字改为nodebb（默认好像是0），或者是上文自己定义的数据库名字
-就酱！然后就可以start了:

###Running
开始：
```bash
$ ./nodebb start
```
停止：
```bash
$ ./nodebb stop
```
也可以npm start或者npm stop来实现。也可以用node app来跑，或者更高端一些的supervisor，grunt神马的：[Running NodeBB](https://docs.nodebb.org/en/latest/running/index.html)


差不多这样就完成了，这货可以说是相当强大的一个东西了感觉，虽然还在完善之中。几乎实现了完整的后台设置页面，管理员可对论坛进行全方面管理。，像hexo一样，你可以根据自己的喜好去设计主题和皮肤。。。先写这么多吧- -