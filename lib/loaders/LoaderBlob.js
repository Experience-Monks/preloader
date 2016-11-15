/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

var LoaderBlob = new Class({
  Extends: LoaderBase,
  /**
   * LoaderBlob will load a file and the content saved in this Loader will be a Blob
   *
   * @class LoaderBlob
   * @constructor
   * @extends {LoaderBase}
   */
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeBlob, options);
  }
});

module.exports = LoaderBlob;
