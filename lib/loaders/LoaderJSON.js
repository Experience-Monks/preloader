/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

/**
 * LoaderJSON will load a JSON file and parse it's content. The content property will contain an Object
 * representation of the JSON data.
 *
 * @class LoaderJSON
 * @constructor
 * @extends {LoaderBase}
 */
var LoaderJSON = new Class({
  Extends: LoaderBase,
  initialize: function (options) {
    Class.parent(this, LoaderBase.typeJSON, options);
  }
});

module.exports = LoaderJSON;
