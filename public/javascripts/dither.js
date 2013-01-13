'use strict';

define(['jquery'],
  function($) {

  var IMAGE_SIZE = 300;

  var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  var Dither = function () {
    this.animation;
    this.currentSource;
    this.image = new Image();
    this.start = window.mozAnimationStartTime || new Date().getTime();
    this.fps = 35;
    this.height = 400;
    this.width = 300;
  };

  Dither.prototype.preview = function () {
    var self = this;

    this.clear();

    this.image.onload = function () {
      self.ctx.drawImage(self.image, 0, 0, self.width, self.height);
    };

    this.image.src = this.currentSource;
  };

  Dither.prototype.clear = function () {
    clearTimeout(this.animation);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  Dither.prototype.run = function (runForever) {
    var self = this;

    this.clear();

    this.image.onload = function () {
      self.ctx.drawImage(self.image, 0, 0, self.width, self.height);
      self.imageData = self.ctx.getImageData(0, 0, self.width, self.height);

      self.imageDataNew = self.ctx.getImageData(0, 0, self.width, self.height);
      self.pixels = self.imageData.data;
      self.pixelsNew = self.imageDataNew.data;
      self.generate(self.start);
    };

    this.image.src = this.currentSource;
  };

  Dither.prototype.generate = function (timestamp) {
    var progress = timestamp - this.start;
    var self = this;

    var imageArea = this.width * this.height * 4;

    for (var i = 0; i < imageArea; i += 2) {
      if (this.imageData.data[i] < 90) {
        for (var p = 0; p < 4; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 185);
        }
      } else if (this.imageData.data[i] < 170) {
        for (var p = 0; p < 4; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 255) + 10;
        }
      } else {
        for (var p = 0; p < 4; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 255) + 50;
        }
      }
    }

    this.ctx.putImageData(this.imageDataNew, 0, 0);

    if (progress < 10000) {
      this.animation = setTimeout(function() {
        requestAnimationFrame(self.generate.bind(self));
      }, 1000 / self.fps);
    }
  };

  return Dither;
});
