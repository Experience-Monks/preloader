/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

var LoaderArrayBuffer = new Class({
  Extends: LoaderBase,
  /**
   * LoaderArrayBuffer will load a file and the content saved in this Loader will be an ArrayBuffer
   *
   * @class LoaderArrayBuffer
   * @constructor
   * @extends {LoaderBase}
   */
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeArraybuffer, options);
  }
});

module.exports = LoaderArrayBuffer;
