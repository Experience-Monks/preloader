/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
// var FileMeta = require('./FileMeta')
var LoaderBase = require('./LoaderBase');

/**
 * LoaderVideo will load a video file. The content property will contain an video tag
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
  load: function (url) {
    this.url = url;
    this.content = document.createElement(this.loadType);
    this.content.setAttribute('preload', 'auto');
    this.content.addEventListener(this.options.loadFullVideo ? 'canplaythrough' : 'canplay', this._dispatchComplete);
    this.content.addEventListener('progress', this._onProgress);
    this.content.setAttribute('src', this.url);
    this.content.load();
  },
  stopLoad: function () {
    this.content.setAttribute('src', '');
    this.content.load();
  },
  _onProgress: function (e) {
    this._dispatchProgress(this._getProgress());
  },
  _dispatchComplete: function () {
    this.content.removeEventListener(this.options.loadFullVideo ? 'canplaythrough' : 'canplay', this._dispatchComplete);
    this.content.removeEventListener('progress', this._onProgress);
    this._dispatchProgress(1);
    Class.parent(this);
  },
  _getProgress: function () {
    if (this.content.buffered && this.content.buffered.length > 0 && this.content.buffered.end && this.content.duration) {
      return (this.content.buffered.end(0) / this.content.duration);
    } else if (this.content.bytesTotal !== undefined && this.content.bytesTotal > 0 && this.content.bufferedBytes !== undefined) {
      return this.content.bufferedBytes / this.content.bytesTotal;
    } else {
      return 0;
    }
  }
});

module.exports = LoaderVideo;
