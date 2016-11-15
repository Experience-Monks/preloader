/* global Blob, Image, ArrayBuffer, FileReader */

/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');
var FileMeta = require('./FileMeta');
var getMimeFromURL = require('./../util/getMimeFromURL');

/**
 * LoaderImage will load in images. If XHR exists in the browser attempting to load image
 * then XHR will be used otherwise LoaderImage will use Image instead to load the Image.
 *
 * @class LoaderImage
 * @constructor
 * @extends {LoaderBase}
 */
var LoaderImage = new Class({

  Extends: LoaderBase,

  initialize: function (options) {
    this._imageLoaded = false;
    Class.parent(this, LoaderBase.typeArraybuffer, options);
  },

  load: function (url) {
    // first we check if we can load with XHR period
    // second check that we can load using the method we'd like to which is ArrayBuffer
    // third we check that we have all the functions to turn an ArrayBuffer to a DataURI
    if (this.options.xhrImages &&
      this.canLoadUsingXHR() &&
      this.canLoadType(this.loadType) &&
      ArrayBuffer && (window.URL || window.webkitURL || FileReader)) {
      Class.parent(this, url);
    // if the above checks dont validate we'll fall back and just use the Image object to preload
    } else {
      this._createAndLoadImage(url);
    }
  },

  _dispatchProgress: function (progress) {
    Class.parent(this, this._imageLoaded ? progress : progress * 0.9999);
  },

  _dispatchComplete: function () {
    if (this._imageLoaded) Class.parent(this);
  },

  _onImageLoadComplete: function () {
    this._imageLoaded = true;
    this._dispatchProgress(1);
    this._dispatchComplete();
  },

  _onImageLoadFail: function () {
    this._dispatchError('Image failed to load');
  },

  _parseContent: function () {
    var arrayBuffer = null;
    var blobData = null;

    if (!this.fileMeta) {
      this.fileMeta = new FileMeta();
    }

    // if the loadType was not set then the meta will be incorrect possibly
    // so we'll read it from the url
    if (!this.loadTypeSet || this.fileMeta.mime === null) {
      this.fileMeta.mime = getMimeFromURL(this.url);
    }

    // get the ArrayBuffer
    if (this.xhr.response instanceof ArrayBuffer) {
      arrayBuffer = this.xhr.response;
    // if theres a property mozResponseArrayBuffer  use that
    } else if (this.xhr.mozResponseArrayBuffer) {
      arrayBuffer = this.xhr.mozResponseArrayBuffer;
    // otherwise try converting the string to an ArrayBuffer
    } else {
      throw new Error('Return type for image load unsupported');
    }

    blobData = new Blob([ arrayBuffer ], { type: this.fileMeta.mime });

    // We'll convert the blob to an Image using FileReader if it exists
    if (window.URL || window.webkitURL) {
      this._createAndLoadImage((window.URL || window.webkitURL).createObjectURL(blobData));
    } else if (FileReader) {
      var reader = new FileReader();

      reader.onloadend = function () {
        if (window.URL || window.webkitURL) {
          (window.URL || window.webkitURL).revokeObjectURL(blobData);
        }

        this._createAndLoadImage(reader.result);
      }.bind(this);

      reader.readAsDataURL(blobData);
    }
  },

  _createAndLoadImage: function (src) {
    this.content = new Image();
    this.content.onload = this._onImageLoadComplete.bind(this);
    this.content.onerror = this._onImageLoadFail.bind(this);
    this.content.src = src;
  }
});

module.exports = LoaderImage;
