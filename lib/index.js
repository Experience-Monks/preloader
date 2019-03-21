/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 *
 */

var Class = require('js-oop');
var EventEmitter = require('events').EventEmitter;
var getExtension = require('./util/getExtension');
var LoaderImage = require('./loaders/LoaderImage');
var LoaderText = require('./loaders/LoaderText');
var LoaderJSON = require('./loaders/LoaderJSON');
var LoaderVideo = require('./loaders/LoaderVideo');
var LoaderAudio = require('./loaders/LoaderAudio');

/**
*
* Object defining which file extensions use which loaders
*
* @property LOADERS
* @type {Object}
*/

var LOADERS = {
  png: LoaderImage,
  jpg: LoaderImage,
  jpeg: LoaderImage,
  webp: LoaderImage,
  gif: LoaderImage,
  json: LoaderJSON,
  mp4: LoaderVideo,
  ogg: LoaderVideo,
  ogv: LoaderVideo,
  webm: LoaderVideo,
  mp3: LoaderAudio,
  wav: LoaderAudio
};

/**
*
* Defines default loader
*
* @property LOADER_DEFAULT
* @type {Function}
*/
var LOADER_DEFAULT = LoaderText;

/**
*
*
* @class Preloader
* @constructor
* @return {Object} Preloader Preloader object
*/

var Preloader = new Class({
  Extends: EventEmitter,
  /**
  *
  * Called on instantiation, sets up properties of Preloader object
  *
  * @method initialize
  *
  */

  initialize: function (options) {
    if (!(this instanceof Preloader)) return new Preloader(options);
    Class.parent(this);
    this.options = this.parseOptions(options);
    if (this.options.onComplete) this.on('complete', this.options.onComplete);
    if (this.options.onProgress) this.on('progress', this.options.onProgress);
    this.reset();
    this.loaders = {};

    this._continueLoadQueue = this._continueLoadQueue.bind(this);
  },

  parseOptions: function (options) {
    return {
      xhrImages: options.xhrImages || false,
      onComplete: typeof options.onComplete === 'function' ? options.onComplete : undefined,
      onProgress: typeof options.onProgress === 'function' ? options.onProgress : undefined,
      throttle: options.throttle || 0
    };
  },

  mergeOptions: function (options) {
    return {
      xhrImages: options.xhrImages || this.options.xhrImages,
      onComplete: typeof options.onComplete === 'function' ? options.onComplete : this.options.onComplete,
      onProgress: typeof options.onProgress === 'function' ? options.onProgress : this.options.onProgress,
      throttle: options.throttle || this.options.throttle
    };
  },

  /**
    *
   * Generic asset loader function - determines loader to be used based on file-extension
   *
   * @method add
   * @param {String} url Base URL of asset
   *
   */
  add: function (url, options) {
    if (url) {
      this.addFromLoaderType(url, this._getLoader(url), options);
    }
  },

  /**
  *
  *Load image - uses the LoaderImage loader
  *
  * @method addImage
  * @param {String} url Base URL of asset
  *
  */
  addImage: function (url, options) {
    this.addFromLoaderType(url, LoaderImage, options);
  },

  /**
  *
  *Load JSON - uses the LoaderJSON loader
  *
  * @method addJSON
  * @param {String} url Base URL of asset
  *
  */
  addJSON: function (url, options) {
    this.addFromLoaderType(url, LoaderJSON, options);
  },

  /**
  *
  * Load text - uses the LoaderText loader
  *
  * @method addText
  * @param {String} url Base URL of asset
  *
  */
  addText: function (url, options) {
    this.addFromLoaderType(url, LoaderText, options);
  },

  /**
  *
  *Load video - uses the LoaderVideo loader
  *
  * @method addVideo
  * @param {String} url Base URL of asset
  *
  */
  addVideo: function (url, options) {
    this.addFromLoaderType(url, LoaderVideo, options);
  },

  /**
  *
  *Load audio - uses the LoaderAudio loader
  *
  * @method addAudio
  * @param {String} url Base URL of asset
  *
  */
  addAudio: function (url, options) {
    this.addFromLoaderType(url, LoaderAudio, options);
  },

  /**
  *
  * Load asset using custom loader
  *
  * @method addFromLoaderType
  * @param {String} url Base URL of asset
  * @param {Function} loaderType Custom loader function
  *
  */
  addFromLoaderType: function (url, LoaderType, options) {
    if (!this.loaders[ url ]) {
      this.loaders[ url ] = new LoaderType(this.mergeOptions(options || {}));
      this.urls.push(url);
      return this.loaders[ url ];
    }
  },

  /**
  *
  * Sets percentage of total load for a given asset
  *
  * @method setPercentage
  * @param {String} url Base URL of asset
  * @param {Number} percentageOfLoad Number <= 1 representing percentage of total load
  *
  */
  setPercentage: function (url, percentageOfLoad) {
    this.percentageOfLoad[ url ] = percentageOfLoad;
  },

  /**
  *
  * Begins loading process
  *
  * @method load
  *
  */
  load: function () {
    if (!this.loading) {
      this._setupPercentages();
      var len = this.options.throttle || this.urls.length;
      for (var i = 0; i < len; i++) {
        this._continueLoadQueue();
      }
    }
  },

  /**
  *
  * Resets loading so you can reuse the preloader. does not remove cached loads so `get()` continues to function for all assets.
  *
  * @method reset
  *
  */
  reset: function () {
    this.percTotal = 0;
    this.loadIdx = 0;
    this.urls = [];
    this.progress = 0;
    this.percentageOfLoad = {};
    this.loading = false;
    this.status = {};
  },

  /**
  *
  * Stops loading process
  *
  * @method stopLoad
  *
  */
  stopLoad: function () {
    if (this.loading) {
      for (var i = 0, len = this.urls.length; i < len; i++) {
        this.loaders[ this.urls[ i ] ].stopLoad();
      }
    }
  },

  /**
  *
  * Retrieves loaded asset from loader
  *
  * @method get
  * @param {String} url Base URL of asset
  * @return asset instance
  */
  get: function (url) {
    return this.loaders[ url ] && this.loaders[ url ].content;
  },

  /**
  *
  * Loops through stated percentages of all assets and standardizes them
  *
  * @method _setupPercentages
  */
  _setupPercentages: function () {
    var percTotal = 0;
    var percScale = 1;
    // var numWPerc = 0
    var numWOPerc = 0;
    var oneFilePerc = 1 / this.urls.length;

    for (var i = 0, len = this.urls.length; i < len; i++) {
      if (this.percentageOfLoad[ this.urls[ i ] ]) {
        percTotal += this.percentageOfLoad[ this.urls[ i ] ];
        // numWPerc++
      } else {
        numWOPerc++;
      }
    }

    if (numWOPerc > 0) {
      if (percTotal > 1) {
        percScale = 1 / percTotal;
        percTotal *= percScale;
      }

      // var percRemaining = 1 - percTotal
      oneFilePerc = (1 - percTotal) / numWOPerc;

      for (var i = 0, len = this.urls.length; i < len; i++) { // eslint-disable-line no-redeclare
        if (this.percentageOfLoad[ this.urls[ i ] ]) {
          this.percentageOfLoad[ this.urls[ i ] ] *= percScale;
        } else {
          this.percentageOfLoad[ this.urls[ i ] ] = oneFilePerc;
        }
      }
    }
  },

  /**
  *
  * With every call, assets are successively loaded  and percentLoaded is updated
  *
  * @method _continueLoadQueue
  */
  _continueLoadQueue: function () {
    if (this.loadIdx < this.urls.length) {
      var url = this.urls[ this.loadIdx ];
      var loader = this.loaders[url];
      this.status[url] = false;

      this.loadIdx++;
      loader.on('progress', this._onLoadProgress.bind(this, url));
      loader.once('error', this._onLoadError.bind(this, url));
      loader.once('complete', this._onLoadComplete.bind(this, url));
      loader.load(url);
    } else if (this._checkComplete()) {
      this.emit('complete');
    }
  },

  /**
  *
  * Logs error, updates progress, and continues the load
  *
  *
  * @method _onLoadError
  * @param {String} url of current loading item
  * @param {String} error Error message/type
  */
  _onLoadError: function (url, error) {
    console.warn('Couldn\'t load ' + url + ' received the error: ' + error);

    var curPerc = this.percentageOfLoad[ url ];

    this.emit('progress', this.percTotal + curPerc, url);
    this.status[url] = true;
    this._continueLoadQueue();
  },

  /**
  *
  * Calculates progress of currently loading asset and dispatches total load progress
  *
  *
  * @method _onLoadProgress
  * @param {String} url of current loading item
  * @param {Number} progress Progress of currently loading asset
  */
  _onLoadProgress: function (url, progress) {
    var curPerc = this.percentageOfLoad[ url ] * progress;

    this.emit('progress', this.percTotal + curPerc, url);
  },

  /**
  *
  * Marks url as complete and updates total load percentage
  *
  *
  * @method _onLoadComplete
  * @param {String} url of current loading item
  * @param {Object} content The loaded content
  */
  _onLoadComplete: function (url, content) {
    this.percTotal += this.percentageOfLoad[ url ];
    this.status[url] = true;
    this._continueLoadQueue();
  },

  /**
  *
  * Returns true / false depending on if all url are finished loading or not
  *
  *
  * @method _checkComplete
  * @return {Boolean} Is loading done?
  */
  _checkComplete: function () {
    var loaded = true;
    for (var i = 0, len = this.urls.length; i < len; i++) {
      if (!this.status[this.urls[ i ]]) loaded = false;
    }
    return loaded;
  },

  /**
  *
  * Retrieves the appropriate loader util given the asset file-type
  *
  *
  * @method _getLoader
  * @param {String} url Base URL of asset
  * @return {Function} Chosen loader util function based on filetype/extension
  */
  _getLoader: function (url) {
    var extension = getExtension(url);
    var loader = LOADER_DEFAULT;
    if (extension && LOADERS[ extension.toLowerCase() ]) loader = LOADERS[ extension.toLowerCase() ];
    return loader;
  }
});

module.exports = Preloader;
