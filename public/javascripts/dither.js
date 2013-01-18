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
    this.image = new Image();
    this.start = window.mozAnimationStartTime || new Date().getTime();
    this.height = 0;
    this.width = 0;
    this.canvas = null;
  };

  Dither.prototype.constrainImage = function (imageRatioHeight) {
    this.width = IMAGE_SIZE;
    this.height = Math.round(IMAGE_SIZE * imageRatioHeight);
  };

  Dither.prototype.preview = function () {
    var self = this;

    if (this.form) {
      this.canvas = $('#dither-preview');
    } else {
      this.canvas = $('#dither-view');
    }

    this.ctx = this.canvas[0].getContext('2d');

    this.image.onload = function (evt) {
      self.width = this.width;
      self.height = this.height;

      var imageRatioWidth = self.width / self.height;
      var imageRatioHeight = self.height / self.width;

      // subsampling check
      if (self.width * self.height > 1024 * 1024) {

      }

      if (imageRatioHeight > imageRatioWidth) {
        // portrait
        self.constrainImage(imageRatioHeight);

      } else if (imageRatioWidth > imageRatioHeight) {
        //landscape
        self.width = Math.round(IMAGE_SIZE * imageRatioWidth);
        self.height = IMAGE_SIZE;

        if (self.width > IMAGE_SIZE) {
          self.constrainImage(imageRatioHeight);
        }

      } else {
        // square
        self.width = IMAGE_SIZE;
        self.height = IMAGE_SIZE;
      }

      // subsampling check
      if (self.width * self.height > 1024 * 1024) {
        self.height = self.height * 500;
      }

      self.canvas
        .attr('width', self.width)
        .attr('height', self.height);

      if (self.form) {
        self.form.find('#image-width').val(self.width);
        self.form.find('#image-height').val(self.height);
      }

      self.ctx.drawImage(self.image, 0, 0, self.width, self.height);
    };

    this.image.src = this.currentSource;
  };

  Dither.prototype.clear = function () {
    if (this.ctx) {
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.restore();
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

    if (progress < 10000) {
      requestAnimationFrame(self.generate.bind(self));
    }
  };

  return Dither;
});
