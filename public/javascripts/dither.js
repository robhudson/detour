'use strict';

define(['jquery'],
  function ($) {

  var Dither = function (options) {
    if (options) {
      this.imageSize = parseInt(options.imageSize, 10) || 300;
      this.ditherPreviewId = options.ditherPreviewId || 'dither-preview';
      this.ditherViewId = options.ditherViewId || 'dither-view';
      this.ttl = parseInt(options.ttl, 10) || 10000;

    } else {
      this.imageSize = 300;
      this.ditherPreviewId = 'dither-preview';
      this.ditherViewId = 'dither-view';
      this.ttl = 10000;
    }

    window.requestAnimationFrame = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.msRequestAnimationFrame;

    this.image = new Image();
    this.start = window.mozAnimationStartTime || new Date().getTime();
    this.height = 0;
    this.width = 0;

  };

  Dither.prototype.constrainImage = function (imageRatioHeight) {
    this.width = this.imageSize;
    this.height = Math.round(this.imageSize * imageRatioHeight);
  };

  Dither.prototype.preview = function (ditherToggle, callback) {
    var self = this;

    if (ditherToggle) {
      this.canvas = $('#' + this.ditherPreviewId);
    } else {
      this.canvas = $('#' + this.ditherViewId);
    }

    this.ctx = this.canvas[0].getContext('2d');

    this.image.onload = function (evt) {
      self.width = this.width;
      self.height = this.height;

      var imageRatioWidth = self.width / self.height;
      var imageRatioHeight = self.height / self.width;

      if (imageRatioHeight > imageRatioWidth) {
        // portrait
        self.constrainImage(imageRatioHeight);

      } else if (imageRatioWidth > imageRatioHeight) {
        //landscape
        self.width = Math.round(self.imageSize * imageRatioWidth);
        self.height = self.imageSize;

        if (self.width > self.imageSize) {
          self.constrainImage(imageRatioHeight);
        }

      } else {
        // square
        self.width = self.imageSize;
        self.height = self.imageSize;
      }

      self.canvas[0].setAttribute('width', self.width + 'px');
      self.canvas[0].setAttribute('height', self.height + 'px');

      if (callback) {
        callback(self);
      }

      self.ctx.drawImage(self.image, 0, 0, self.width, self.height);
    };

    this.image.src = this.currentSource;
  };

  Dither.prototype.clear = function () {
    if (this.ctx) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.save();
    }
  };

  Dither.prototype.run = function (runForever) {
    var self = this;

    this.clear();

    if (self.width > 0 && self.height > 0) {
      this.image.onload = function () {
        self.ctx.drawImage(self.image, 0, 0, self.width, self.height);
        self.imageData = self.ctx.getImageData(0, 0, self.width, self.height);

        self.imageDataNew = self.ctx.getImageData(0, 0, self.width, self.height);
        self.pixels = self.imageData.data;
        self.pixelsNew = self.imageDataNew.data;
        self.generate(self.start);
      };

      this.image.src = this.currentSource;
    }
  };

  Dither.prototype.generate = function (timestamp) {
    var progress = timestamp - this.start;
    var self = this;
    var p;

    var imageArea = this.width * this.height * 4;

    for (var i = 0; i < imageArea; i += 2) {
      if (this.imageData.data[i] < 90) {
        for (p = 0; p < 4; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 185);
        }
      } else if (this.imageData.data[i] < 170) {
        for (p = 1; p < 3; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 195) + 10;
        }
      } else {
        for (p = 1; p < 3; p ++) {
          this.pixelsNew[i ++] = Math.floor(Math.random() * 255) + 10;
        }
      }
    }

    this.ctx.putImageData(this.imageDataNew, 0, 0);

    if (progress < this.ttl) {
      window.requestAnimationFrame(self.generate.bind(self));
    }
  };

  return Dither;
});
