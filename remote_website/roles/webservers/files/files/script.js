// -----------------------------------------------------------------------------------
// http://wowslider.com/
// JavaScript Wow Slider is a free software that helps you easily generate delicious 
// slideshows with gorgeous transition effects, in a few clicks without writing a single line of code.
// Last updated: 2012-03-29
//
//***********************************************
// Obfuscated by Javascript Obfuscator
// http://javascript-source.com
//***********************************************
function ws_stack(d,a,b){var e=jQuery;var c=e("li",b);this.go=function(k,i,n,m){var h=c.length>2?(k-i+1)%c.length:1;if(Math.abs(n)>=1){h=(n>0)?0:1}h=h^!!d.revers;var g=e(c.get(h?i:k));var f=e(c.get(h?k:i));c.each(function(o){if(h&&o!=i){this.style.zIndex=(Math.max(0,this.style.zIndex-1))}});var j=(d.revers?-1:1)*d.width;var l=h?0:j;f.stop(1,1).css({"z-index":4,left:(j-l+"px")});if(!h){g.stop(1,1).css({left:0})}g.css({"z-index":3});f.animate({left:(l+"px")},d.duration,"easeInOutExpo");return k}};// -----------------------------------------------------------------------------------
// http://wowslider.com/
// JavaScript Wow Slider is a free software that helps you easily generate delicious 
// slideshows with gorgeous transition effects, in a few clicks without writing a single line of code.
// Last updated: 2012-03-29
//
//***********************************************
// Obfuscated by Javascript Obfuscator
// http://javascript-source.com
//***********************************************
jQuery("#wowslider-container1").wowSlider({effect:"stack",prev:"prev",next:"next",duration:10*100,delay:55*100,outWidth:1050,outHeight:380,width:1050,height:380,autoPlay:true,stopOnHover:true,loop:true,bullets:true,caption:false,controls:false,logo:"engine1/loading.gif",images:0});