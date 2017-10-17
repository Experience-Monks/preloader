/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

/**
 * LoaderCSS will load a css file and inject into DOM.
 *
 * @class LoaderBase
 * @constructor
 * @extends {LoaderBase}
 */
var LoaderCSS = new Class({
  Extends: LoaderBase,
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeCSS, options);
  },

  _parseContent: function () {
    if(document) {
      var link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';

      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
});

module.exports = LoaderCSS;
