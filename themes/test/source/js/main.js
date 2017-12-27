// var utils = {
//   norm: function(value, min, max) {
//     return (value - min) / (max - min);
//   },

//   lerp: function(norm, min, max) {
//     return (max - min) * norm + min;
//   },

//   map: function(value, sourceMin, sourceMax, destMin, destMax) {
//     return utils.lerp(utils.norm(value, sourceMin, sourceMax), destMin, destMax);
//   },

//   clamp: function(value, min, max) {
//     return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
//   },

//   distance: function(p0, p1) {
//     var dx = p1.x - p0.x,
//       dy = p1.y - p0.y;
//     return Math.sqrt(dx * dx + dy * dy);
//   },

//   distanceXY: function(x0, y0, x1, y1) {
//     var dx = x1 - x0,
//       dy = y1 - y0;
//     return Math.sqrt(dx * dx + dy * dy);
//   },

//   circleCollision: function(c0, c1) {
//     return utils.distance(c0, c1) <= c0.radius + c1.radius;
//   },

//   circlePointCollision: function(x, y, circle) {
//     return utils.distanceXY(x, y, circle.x, circle.y) < circle.radius;
//   },

//   pointInRect: function(x, y, rect) {
//     return utils.inRange(x, rect.x, rect.x + rect.radius) &&
//       utils.inRange(y, rect.y, rect.y + rect.radius);
//   },

//   inRange: function(value, min, max) {
//     return value >= Math.min(min, max) && value <= Math.max(min, max);
//   },

//   rangeIntersect: function(min0, max0, min1, max1) {
//     return Math.max(min0, max0) >= Math.min(min1, max1) &&
//       Math.min(min0, max0) <= Math.max(min1, max1);
//   },

//   rectIntersect: function(r0, r1) {
//     return utils.rangeIntersect(r0.x, r0.x + r0.width, r1.x, r1.x + r1.width) &&
//       utils.rangeIntersect(r0.y, r0.y + r0.height, r1.y, r1.y + r1.height);
//   },

//   degreesToRads: function(degrees) {
//     return degrees / 180 * Math.PI;
//   },

//   radsToDegrees: function(radians) {
//     return radians * 180 / Math.PI;
//   },

//   randomRange: function(min, max) {
//     return min + Math.random() * (max - min);
//   },

//   randomInt: function(min, max) {
//     return min + Math.random() * (max - min + 1);
//   },

//   getmiddle: function(p0, p1) {
//     var x = p0.x,
//       x2 = p1.x;
//     middlex = (x + x2) / 2;
//     var y = p0.y,
//       y2 = p1.y;
//     middley = (y + y2) / 2;
//     pos = [middlex, middley];

//     return pos;
//   },

//   getAngle: function(p0, p1) {
//     var deltaX = p1.x - p0.x;
//     var deltaY = p1.y - p0.y;
//     var rad = Math.atan2(deltaY, deltaX);
//     return rad;
//   },
//   inpercentW: function(size) {
//     return (size * W) / 100;
//   },

//   inpercentH: function(size) {
//     return (size * H) / 100;
//   },

// }

// // 声明  全局变量
// var slider = document.getElementById("slider");
// var canvas, ctx, W, H, gridX, gridY, gravity, duration, resolution, speed, radius;
// var timer;


// function shape(x, y, texte) {
//   this.x = x;
//   this.y = y;
//   this.size = W/6;

//   this.text = texte;
//   this.placement = [];
//   this.vectors = [];

// }

// shape.prototype.getValue = function() {
//   console.log("get black pixels position");

//   // Draw the shape :^)

//   ctx.textAlign = "center";
//   ctx.font = "bold " + this.size + "px arial";
//   ctx.fillText(this.text, this.x, this.y);


//   var idata = ctx.getImageData(0, 0, W, H);

//   var buffer32 = new Uint32Array(idata.data.buffer);

//   for (var y = 0; y < H; y += gridY) {
//     for (var x = 0; x < W; x += gridX) {

//       if (buffer32[y * W + x]) {
//         this.placement.push(new particle(x, y));
//       }
//     }
//   }
//   ctx.clearRect(0, 0, W, H);

// }

// var colors = [
//   '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
//   '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50',
//   '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
//   '#FF5722'
// ];

// function particle(x, y, type) {
//   this.radius = 1.1;
//   this.futurRadius = utils.randomInt(radius, radius+3);
  
  
//   this.rebond = utils.randomInt(1, 5);
//   this.x = x;
//   this.y = y;
  
//   this.dying = false;
  
//   this.base = [x, y]

//   this.vx = 0;
//   this.vy = 0;
//   this.type = type;
//   this.friction = .99;
//   this.gravity = gravity;
//   this.color = colors[Math.floor(Math.random() * colors.length)];

//   this.getSpeed = function() {
//     return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
//   };

//   this.setSpeed = function(speed) {
//     var heading = this.getHeading();
//     this.vx = Math.cos(heading) * speed;
//     this.vy = Math.sin(heading) * speed;
//   };

//   this.getHeading = function() {
//     return Math.atan2(this.vy, this.vx);
//   };

//   this.setHeading = function(heading) {
//     var speed = this.getSpeed();
//     this.vx = Math.cos(heading) * speed;
//     this.vy = Math.sin(heading) * speed;
//   };

//   this.angleTo = function(p2) {
//     return Math.atan2(p2.y - this.y, p2.x - this.x);

//   };

//   this.update = function(heading) {
//     this.x += this.vx;
//     this.y += this.vy;
//     this.vy += gravity;

//     this.vx *= this.friction;
//     this.vy *= this.friction;
    
//     if(this.radius < this.futurRadius && this.dying === false){
//       this.radius += duration;
//     }else{
//       this.dying = true;
//     }
      
//     if(this.dying === true){
//       this.radius -= duration;

      
//     }
 

//     ctx.beginPath();

//     ctx.fillStyle = this.color;

//     ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
//     ctx.fill();
//     ctx.closePath();

//     if (this.y < 0 || this.radius < 1) {
//       this.x = this.base[0];
//       this.dying = false;
//       this.y = this.base[1];
//       this.radius = 1.1;
//       this.setSpeed(speed);
//       this.futurRadius = utils.randomInt(radius, radius+3);
//       this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));
//     }

//   };

//   this.setSpeed(utils.randomInt(.1, .5));
//   this.setHeading(utils.randomInt(utils.degreesToRads(0), utils.degreesToRads(360)));

// }

// if (slider) {
//   function init () {
//     canvas = document.getElementById("canvas");
//     ctx = canvas.getContext('2d');
//     W = canvas.width = slider.offsetWidth;
//     H = canvas.height = slider.offsetHeight;

//     gridX = 5;
//     gridY = 5;

//     gravity = parseFloat(document.getElementById("2").value);
//     duration =  parseFloat(document.getElementById("3").value);
//     resolution = parseFloat(document.getElementById("4").value);
//     speed = parseFloat(document.getElementById("5").value);
//     radius = parseFloat(document.getElementById("6").value);

//     fieldvalue = document.getElementById("message");

//     message = new shape(W / 2, H / 2 + 50, fieldvalue.value);

//     message.getValue();

//     update();  
//   }
//   init()
// }


// function change() {
//   ctx.clearRect(0, 0, W, H);

//   gridX = parseFloat(element4.value);
//   gridY = parseFloat(element4.value);
//   message.placement = [];
//   message.text = fieldvalue.value;
//   message.getValue();
// }


// function changeV() {
//     gravity = parseFloat(element2.value);
//     duration =  parseFloat(element3.value);
//     speed = parseFloat(element5.value);
//     radius = parseFloat(element6.value);
// }

// var fps = 100;
// function update() {
//   clearTimeout(timer);
//   timer = setTimeout(function() {
//     ctx.clearRect(0, 0, W, H);


//     for (var i = 0; i < message.placement.length; i++) {
//       message.placement[i].update();
//     }

//     requestAnimationFrame(update);
//   }, 1000 / fps);
// }

// window.onresize = function () {
//   init && init();
// }

var timer = null;

var appendArrow = function() {
  var slider = document.querySelector('.slider');
  var magic = document.querySelector('.magic-link');
  var arrow = document.createElement('div');
  arrow.innerHTML = `
    <div class='arrow'>
      <img src='/images/home/arrow.svg'/>
    <div>
  `;
  if (slider) {
    slider.appendChild(arrow);
    arrow.addEventListener('click', function() {
      var target = slider.offsetHeight + magic.offsetHeight;
      myScrollTo(target, 10, function() {
        slider.style.display = 'none';
        magic.style.display = 'none';
        document.body.scrollTop = 0;
      })
    })
  }
}
var myScrollTo = function(target, speed, fn){
  console.log(target)
  timer && clearTimeout(timer);
  var _top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
  console.log(_top)
  if (_top < target) {
    _top += speed;
    window.scrollTo(0,_top);
  } else {
    fn && fn()
    return ;
  }
  timer = setTimeout(function(){
    myScrollTo(target, speed, fn);
  }, 1)
}

var navbarBurger = document.querySelector('#navbarBurger');
navbarBurger.addEventListener('click', function (el) {
  document.querySelector('#navMenuIndex').classList.toggle("is-active"); 
});

//资源预加载
if (is_home) {
  var loader = new resLoader({
    resources : [
     '/images/home/bg.jpg',
     '/images/home/app.png',
     '/images/home/app_hover.png',
     '/images/home/vis.png',
     '/images/home/vis_hover.png',
     '/images/home/vis3.png',
     '/images/home/vis3_hover.png',
     '/images/home/web.png',
     '/images/home/web_hover.png',
     '/images/home/web3.png',
     '/images/home/web3_hover.png',
     '/images/home/yins.png',
     '/images/home/yins_hover.png'
    ],
    onStart : function(total){
      // console.log('start:'+total);
    },
    onProgress : function(current, total){
      // console.log(current+'/'+total);
      // var percent = current/total*100;
      // console.log(percent+ '%')
    },
    onComplete : function(total){
      appendArrow();
      document.querySelector('.mask').classList.toggle("mask-hide"); 
    }
  });
  loader.start();  
}
