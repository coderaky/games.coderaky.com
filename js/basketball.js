
document.addEventListener("DOMContentLoaded", function(event) {

 window.onload = function() {

  var Vector = {
   _x: 1,
   _y: 0,

   create: function(x, y) {
   var obj = Object.create(this);
   obj.setX(x);
   obj.setY(y);
   return obj;
   },

   setX: function(value) {
   this._x = value;
   },

   getX: function() {
   return this._x
   },

   setY: function(value) {
   this._y = value;
   },

   getY: function() {
   return this._y;
   },

   setAngle: function(angle) {
   var length = this.getLength();
   this._x = Math.cos(angle) * length;
   this._y = Math.sin(angle) * length;
   },

   getAngle: function() {
   return Math.atan2(this._y, this._x);
   },

   setLength: function(length) {
   var angle = this.getAngle();
   this._x = Math.cos(angle) * length;
   this._y = Math.sin(angle) * length;
   },

   getLength: function() {
   return Math.sqrt(this._x * this._x + this._y * this._y);
   },

   add: function(v2) {
   return Vector.create(this._x + v2.getX(), this._y + v2.getY());
   },

   subtract: function(v2) {
   return Vector.create(this._x - v2.getX(), this._y - v2.getY());
   },

   scale: function(value) {
   return Vector.create(this._x * value, this._x * value);
   }
  };



  var Particle = {
   position: null,
   velocity: null,
   gravity: null,

   create: function(x, y, speed, direction, grav) {
   var obj = Object.create(this);
   obj.position = Vector.create(x, y);
   obj.velocity = Vector.create(0, 0);
   obj.velocity.setLength(speed);
   obj.velocity.setAngle(direction);
   obj.gravity = Vector.create(0, grav || 0);

   return obj;
   },

   accelerate: function(vector) {
   this.velocity = this.velocity.add(vector);
   },

   update: function() {
   this.velocity = this.velocity.add(this.gravity);
   this.position = this.position.add(this.velocity);
   }
  };



  var ball = document.getElementById("ball"),
      offsetY,
      ballRadius,
      basket = document.getElementById("basket"),
      basketWidth,
      ratio,
      scale,
      w,
      h;

  var p,
      start,
      force,
      timestamp = null,
      lastMouse,
      hasThrown = false,
      highEnough = false,
      lastY,
      rot;

  var shots = 0,
      hits = 0,
      score = 0,
      accuracy = 0;



  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize);


  resize();

  TweenMax.to(".stage", 1, {autoAlpha:1, delay:1});






  function addEvents() {

   ball.addEventListener("mousedown", grabBall);
   ball.addEventListener("touchstart", grabBall);
   ball.addEventListener("mouseup", releaseBall);
   ball.addEventListener("touchend", releaseBall);

  }




  function removeEvents() {

   ball.removeEventListener("mousedown", grabBall);
   ball.removeEventListener("touchstart", grabBall);
   ball.removeEventListener("mouseup", releaseBall);
   ball.removeEventListener("touchend", releaseBall);

  }




  function resize() {

   removeEvents();

   addEvents();


   offsetY = ball.getBoundingClientRect().height*1.5;

   ballRadius = Math.min(ball.getBoundingClientRect().width, ball.getBoundingClientRect().height);

   basketWidth = Math.round(basket.querySelector("rect").getBoundingClientRect().width);

   ratio = basketWidth / ballRadius - 0.1;

   w = window.innerWidth;
   h = window.innerHeight;

   TweenMax.set(ball, {clearProps:"all"});

  TweenMax.set(ball, {y:"+="+offsetY});

   scale = TweenMax.to(ball, 0.5, {scale:ratio, ease:Power1.easeInOut}).progress(1).pause(0);

  }




  function tick() {
   var currY = p.position.getY();
   var currX = p.position.getX();

   if(hasThrown) {

    if(currY < 0) highEnough = true;

      if(highEnough) {

       if(lastY < currY && force.getLength() > 15) {
         basket.style.zIndex = 1;


         if(currY < 10 && currY > -10) {
           hasThrown = false;

           if(currX > basketWidth*0.1 && currX < basketWidth || currX < -basketWidth*0.1 && currX > -basketWidth) {

             force.setX(currX/10);
             force.setLength(force.getLength()*0.7);
             p.velocity = force;

             basket.style.zIndex = 0;


            } else if(currX <= basketWidth && currX >= -basketWidth) {
              score += 2;
              hits += 1;

             if(force.getX() > 2 || force.getX() < -2) {
              score += 1;
             }


             TweenMax.to("#net", 1, {scaleY:1.1, transformOrigin:"50% 0", ease:Elastic.easeOut});
             TweenMax.to("#net", 0.3, {scale:1, transformOrigin:"50% 0", ease:Power2.easeInOut, delay:0.6});
            }
          }
        }
      }
   }

   p.update();
   TweenMax.set(ball, {
    x:p.position.getX(),
    y:currY,
    rotation:rot
   });


   lastY = currY;

  };





  function grabBall(e) {

   e.preventDefault();

   p = Particle.create(0, offsetY, 0, 0, 0);
   force = Vector.create(0,0);
   start = Vector.create(getMouse(e).x, getMouse(e).y-offsetY);

   document.addEventListener("mousemove", moveBall);
   document.addEventListener("touchmove", moveBall);
  };




  function moveBall(e) {

   e.preventDefault();

   getSpeed(e);

   TweenMax.set(ball, {x:p.position.getX(), y:p.position.getY()});

  };




  function releaseBall() {

   ball.removeEventListener("mousedown", grabBall);
   ball.removeEventListener("touchstart", grabBall);
   document.removeEventListener("mousemove", moveBall);
   document.removeEventListener("touchmove", moveBall);
   timestamp = null;
   lastMouseX = null;
   lastMouseY = null;

   hasThrown = true;

   shots += 1;

   scale.play(0)

   if(force.getLength() > 30) force.setLength(30);
   p.velocity = force;
   p.gravity = Vector.create(0,0.8);

   if(force.getX() > 0) {
    rot = "-=4";
   } else {
    rot = "+=4";
   }

   TweenMax.ticker.addEventListener("tick", tick);

   TweenMax.delayedCall(2, reset);

  };




  function reset() {

   TweenMax.ticker.removeEventListener("tick", tick);

   p.gravity = 0;

   hasThrown = false;
   highEnough = false;

   basket.style.zIndex = 0;

   ball.addEventListener("mousedown", grabBall);
   ball.addEventListener("touchstart", grabBall);

   updateScore();


   TweenMax.to(ball, 1, {
    x:0,
    y:offsetY,
    scale:1,
    rotation:0,
    ease:Power3.easeOut
   });

  };




  function getMouse(e) {

   return {
    x:e.clientX || e.targetTouches[0].clientX,
    y:e.clientY || e.targetTouches[0].clientY
   };

  };




  function getSpeed(e) {

   e.preventDefault();

   if(timestamp === null) {
    timestamp = Date.now();
    lastMouse = getMouse(e);
    return;
   };

   var now = Date.now(),
   currMouse = getMouse(e),
   dx = currMouse.x - lastMouse.x,
   dy = currMouse.y - lastMouse.y;
   
   dy *= 2;
   dx /= 2;

   timestamp = now;
   lastMouse = currMouse;

   force = Vector.create(dx, dy);
   p.position.setX(getMouse(e).x - start.getX());
   p.position.setY(getMouse(e).y - start.getY());

  };




  function updateScore() {
   accuracy = hits / shots;

   document.getElementById("shots").innerHTML = "Shots: " + shots;
   document.getElementById("hits").innerHTML = "Score: " + score;
   document.getElementById("accuracy").innerHTML = "Accuracy: " + Math.round(accuracy * 100) + "%"
  }
 };
});
