/* global XMLHttpRequest, ArrayBuffer, Blob */

/**
 * This module will contain everything related to preloading.
 *
 * @module preloader
 */
var Class = require('js-oop');
var FileMeta = require('./FileMeta');
var stringToArrayBuffer = require('../util/stringToArrayBuffer');
var getMimeFromURL = require('../util/getMimeFromURL');
var EventEmitter = require('events').EventEmitter;

var LoaderBase = new Class({
  Extends: EventEmitter,
  /**
   * LoaderBase is the base class for all Preloader's. It wraps XHR nicely with Signal's as it's event system
   * also it should be able to handle working with: text, JSON, ArrayBuffer, Blob, and Document data out of the
   * box. (data XHR2 is able to handle)
   *
   * @class LoaderBase
   * @constructor
   */
  initialize: function (loadType, options) {
    Class.parent(this);
    this.options = options;
    if (this.options.onComplete) this.on('complete', this.options.onComplete);
    if (this.options.onProgress) this.on('progress', this.options.onProgress);
    this.xhr = null;
    this.content = null;
    this.url = null;
    this.loadType = loadType || LoaderBase.typeText;
    this.loadTypeSet = false;
    this.fileMeta = null;

    this._onStateChange = this._onStateChange.bind(this);
    this._onProgress = this._onProgress.bind(this);
    this._dispatchProgress = this._dispatchProgress.bind(this);
    this._dispatchComplete = this._dispatchComplete.bind(this);
  },

  /**
   * Call this method to find out if we can load data using XHR. This maybe useful for an Image loader for instance
   * if XHR can't be used then we can load the content using Image instead.
   *
   * @method canLoadUsingXHR
   * @return {[type]} [description]
   */
  canLoadUsingXHR: function () {
    return typeof XMLHttpRequest !== 'undefined';
  },

  canLoadType: function (type) {
    var tempXHR = new XMLHttpRequest();

    // need to open for ff so it doesn't fail
    tempXHR.open('GET', 'someFakeURL', true);

    return checkAndSetType(tempXHR, type);
  },

  /**
   * The load function should be called to start preloading data.
   *
   *
   * The first parameter passed to the load function is the url to the data to be loaded.
   * It should be noted that mimetype for binary Blob data is read from
   * the file extension. EG. jpg will use the mimetype "image/jpeg".
   *
   *
   * @method load
   * @param  {String} url This is the url to the data to be loaded
   */
  load: function (url) {
    this.url = url;

    if (this.canLoadUsingXHR()) {
      this.xhr = new XMLHttpRequest();
      this.xhr.open('GET', url, true);

      this.xhr.onreadystatechange = this._onStateChange;
      this.xhr.onprogress !== undefined && (this.xhr.onprogress = this._onProgress);

      if (this.loadType !== LoaderBase.typeText) {
        if (!checkIfGoodValue.call(this)) {
          console.warn('Attempting to use incompatible load type ' + this.loadType + '. Switching it to ' + LoaderBase.typeText);
          this.loadType = LoaderBase.typeText;
        }

        try {
          this.loadTypeSet = checkResponseTypeSupport.call(this) && checkAndSetType(this.xhr, this.loadType);
        } catch (e) {
          this.loadTypeSet = false;
        }

        if (!this.loadTypeSet && (this.loadType === LoaderBase.typeBlob || this.loadType === LoaderBase.typeArraybuffer)) {
          this.xhr.overrideMimeType('text/plain; charset=x-user-defined');
        }
      }

      this.xhr.send();
    }
  },

  /**
   * Call this function to stop loading the asset which is currently being loaded.
   *
   * @method stopLoad
   */
  stopLoad: function () {
    this.xhr.abort();
  },

  /**
   * When this function is called it will simply dispatch onStart. It maybe useful for classes
   * which extend LoaderBase to override this function.
   *
   * @method _dispatchStart
   * @protected
   */
  _dispatchStart: function () {
    this.emit('start');
  },

  /**
   * When this function is called it will simply dispatch onProgress. It maybe useful for classes
   * which extend LoaderBase to override this function.
   *
   * @method _dispatchProgress
   * @protected
   * @param {Number} value This is a value between 0-1 which is the percentage of the files load
   */
  _dispatchProgress: function (value) {
    this.emit('progress', value);
  },

  /**
   * When this function is called it will simply dispatch onComplete. It maybe useful for classes
   * which extend LoaderBase to override this function.
   *
   * @method _dispatchComplete
   * @protected
   */
  _dispatchComplete: function () {
    this.emit('complete', this.content);
  },

  /**
   * When this function is called it will simply dispatch onError. It maybe useful for classes
   * which extend LoaderBase to override this function.
   *
   * @method _dispatchError
   * @protected
   * @param {String} msg The error message we'll be dispatching
   */
  _dispatchError: function (msg) {
    this.emit('error', msg);
  },

  /**
   * This callback will be called when the XHR progresses in its load.
   *
   * @method _onProgress
   * @protected
   * @param  {XMLHttpRequestProgressEvent} ev This event contains data for the progress of the load
   */
  _onProgress: function (ev) {
    var loaded = ev.loaded || ev.position;
    var totalSize = ev.total || ev.totalSize;

    if (totalSize) {
      this._dispatchProgress(loaded / totalSize);
    } else {
      this._dispatchProgress(0);
    }
  },

  /**
   * This function is called whenever the readyState of the XHR object changes.
   *
   *   this.xhr.readyState == 2 //send() has been called, and headers and status are available
   *   this.xhr.readyState == 3 //Downloading; responseText holds partial data.
   *   this.xhr.readyState == 4 //Done
   *
   * You should also handle HTTP error status codes:
   *
   *   this.xhr.status == 404 //file doesn't exist
   *
   * @method _onStateChange
   * @protected
   */
  _onStateChange: function () {
    if (this.xhr.readyState > 1) {
      var status;
      var waiting = false;
      // Fix error in IE8 where status isn't available until readyState=4
      try { status = this.xhr.status; } catch (e) { waiting = true; }

      if (status === 200) {
        switch (this.xhr.readyState) {

          // send() has been called, and headers and status are available
          case 2:

            this.fileMeta = new FileMeta(this.xhr.getAllResponseHeaders());

            this._dispatchStart();
            break;

          // Downloading; responseText holds partial data.
          case 3:

            // todo progress could be calculated here if onprogress does not exist on XHR
            // this.onProgress.dispatch();
            break;

          // Done
          case 4:

            this._parseContent();

            this._dispatchComplete();
            break;
        }
      } else if (!waiting) {
        this.xhr.onreadystatechange = undefined;
        this._dispatchError(this.xhr.status);
      }
    }
  },

  /**
   * This function will grab the response from the content loaded and parse it out
   *
   * @method _parseContent
   * @protected
   */
  _parseContent: function () {
    if (this.loadTypeSet || this.loadType === LoaderBase.typeText) {
      this.content = this.xhr.response || this.xhr.responseText;
    } else {
      switch (this.loadType) {

        case LoaderBase.typeArraybuffer:

          if (ArrayBuffer) {
            this.content = stringToArrayBuffer(this.xhr.response);
          } else {
            throw new Error('This browser does not support ArrayBuffer');
          }
          break;

        case LoaderBase.typeBlob:
        case LoaderBase.typeVideo:
        case LoaderBase.typeAudio:

          if (Blob) {
            if (!this.fileMeta) {
              this.fileMeta = new FileMeta();
            }

            if (this.fileMeta.mime === null) {
              this.fileMeta.mime = getMimeFromURL(this.url);
            }

            this.content = new Blob([ stringToArrayBuffer(this.xhr.response) ], { type: this.fileMeta.mime });
          } else {
            throw new Error('This browser does not support Blob');
          }
          break;

        case LoaderBase.typeJSON:

          this.content = JSON.parse(this.xhr.response);
          break;

        case LoaderBase.typeDocument:

          // this needs some work pretty sure there's a better way to handle this
          this.content = this.xhr.response;
          break;

      }
    }
  }
});

function checkIfGoodValue () {
  return this.loadType === LoaderBase.typeText ||
     this.loadType === LoaderBase.typeArraybuffer ||
     this.loadType === LoaderBase.typeBlob ||
     this.loadType === LoaderBase.typeJSON ||
     this.loadType === LoaderBase.typeDocument ||
     this.loadType === LoaderBase.typeVideo ||
     this.loadType === LoaderBase.typeAudio;
}

function checkResponseTypeSupport () {
  return this.xhr.responseType !== undefined;
}

function checkAndSetType (xhr, loadType) {
  if (loadType === LoaderBase.typeVideo || loadType === LoaderBase.typeAudio) {
    loadType = LoaderBase.typeBlob;
  }

  xhr.responseType = loadType;

  return xhr.responseType === loadType;
}

LoaderBase.typeText = 'text';
LoaderBase.typeArraybuffer = 'arraybuffer';
LoaderBase.typeBlob = 'blob';
LoaderBase.typeJSON = 'json';
LoaderBase.typeDocument = 'document';
LoaderBase.typeVideo = 'video';
LoaderBase.typeAudio = 'audio';

module.exports = LoaderBase;
