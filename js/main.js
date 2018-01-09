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
  timer && clearTimeout(timer);
  var _top = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop || 0;
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
     '/images/home/home.png',
     '/images/home/home_hover.png',
     '/images/home/Blog.png',
     '/images/home/Blog_hover.png',
     '/images/home/about.png',
     '/images/home/about_hover.png',
     '/images/home/nav.png',
     '/images/home/nav_hover.png',
     '/images/home/source.png',
     '/images/home/source_hover.png',
     '/images/home/game.png',
     '/images/home/game_hover.png'
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
} else {
  document.querySelector('.mask').classList.toggle("mask-hide"); 
}
