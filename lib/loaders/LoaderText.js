/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

/**
 * LoaderText will load a file and the content saved in this Loader will be a String.
 *
 * @class LoaderText
 * @constructor
 * @extends {LoaderBase}
 */
var LoaderText = new Class({
  Extends: LoaderBase,
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeText, options);
  }
});

module.exports = LoaderText;
