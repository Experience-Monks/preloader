/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

/**
 * LoaderVideo will load a video file. The content property will contain a video tag.
 *
 * @class LoaderVideo
 * @constructor
 * @extends {LoaderBase}
 */
var LoaderVideo = new Class({
  Extends: LoaderBase,
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeVideo, options);
  },

  _parseContent: function () {
    Class.parent(this);

    if (window.URL && window.URL.createObjectURL) {
      var blobURL = window.URL.createObjectURL(this.content);
      this.content = document.createElement(this.loadType);
      this.content.src = blobURL;
    } else {
      throw new Error('This browser does not support URL.createObjectURL()');
    }
  }
});

module.exports = LoaderVideo;
