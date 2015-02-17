/**
 * This module will contain everything related to preloading.
 * 
 * @module preloader
 */
var Class = require('js-oop');
var LoaderCache = require('./LoaderCache');
var FileMeta = require('./FileMeta');
var Signal = require('signals');
var UtilArrayBuffer = require('./util/UtilArrayBuffer');
var UtilHTTP = require('./util/UtilHTTP');
var XHR = XMLHttpRequest;

var LoaderBase = new Class({

	/**
	 * LoaderBase is the base class for all Preloader's. It wraps XHR nicely with Signal's as it's event system
	 * also it should be able to handle working with: text, JSON, ArrayBuffer, Blob, and Document data out of the
	 * box. (data XHR2 is able to handle)
	 * 
	 * @class LoaderBase
	 * @constructor
	 */
	initialize: function( loadType ) {

		this.xhr = null;
		this.content = null;
		this.url = null;
		this.cacheID = null;
		this.loadType = loadType || LoaderBase.typeText;
		this.loadTypeSet = false;
		this.fileMeta = null;
		this.onStart = new Signal();
		this.onProgress = new Signal();
		this.onComplete = new Signal();
		this.onError = new Signal();

		this._onStateChange = this._onStateChange.bind( this );
		this._onProgress = this._onProgress.bind( this );
	},

	/**
	 * Call this method to find out if we can load data using XHR. This maybe useful for an Image loader for instance
	 * if XHR can't be used then we can load the content using Image instead.
	 * 
	 * @method canLoadUsingXHR
	 * @return {[type]} [description]
	 */
	canLoadUsingXHR: function() {

		return XHR !== undefined;
	},

	canLoadType: function( type ) {

		var tempXHR = new XHR();

		//need to open for ff so it doesn't fail
		tempXHR.open( 'GET', 'someFakeURL', true );

		return checkAndSetType( tempXHR, type );
	},

	/**
	 * The load function should be called to start preloading data. 
	 * 
	 * 
	 * The first parameter passed to the load function is the url to the data to be loaded. 
	 * It should be noted that mimetype for binary Blob data is read from 
	 * the file extension. EG. jpg will use the mimetype "image/jpeg".
	 *
	 * The second parameter is a String which will be used to defetermine if content should be cacheIDd in memory
	 * this is useful if you know the asset will be loaded often or you just want the data to be
	 * stored in memory. The ID passed can be used with LoaderCache to get the cacheIDd content.
	 *
	 * @method load
	 * @param  {String} url This is the url to the data to be loaded
	 * @param  {Boolean} cacheID If you'd like to cacheID the content to be loaded in memory pass in true
	 */
	load: function( url, cacheID ) {

		this.url = url;
		this.cacheID = cacheID;

		if( LoaderCache.hasFile( this.url ) ) {

			this.content = LoaderCache.get( this.url );
			this._dispatchProgress( 1 );
			this._dispatchComplete();
		} else if( this.canLoadUsingXHR() ) {

			this.xhr = new XHR();
			this.xhr.open( 'GET', url, true );

			this.xhr.onreadystatechange = this._onStateChange;
			this.xhr.onprogress !== undefined && ( this.xhr.onprogress = this._onProgress );


			if( this.loadType != LoaderBase.typeText ) {

				if( !checkIfGoodValue.call( this ) ) {

					console.warn( 'Attempting to use incompatible load type ' + this.loadType + '. Switching it to ' + LoaderBase.typeText );
					this.loadType = LoaderBase.typeText;
				}

				try{
					
					this.loadTypeSet = checkResponseTypeSupport.call( this ) && checkAndSetType( this.xhr, this.loadType );	
				} catch( e ) {

					this.loadTypeSet = false;
				}
				

				if( !this.loadTypeSet &&  ( this.loadType == LoaderBase.typeBlob ||
											this.loadType == LoaderBase.typeArraybuffer ) ) {

					this.xhr.overrideMimeType( 'text/plain; charset=x-user-defined' );
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
	stopLoad: function() {

		this.xhr.abort();
	},

	/**
	 * When this function is called it will simply dispatch onStart. It maybe useful for classes
	 * which extend LoaderBase to override this function.
	 *
	 * @method _dispatchStart
	 * @protected
	 */
	_dispatchStart: function() {

		this.onStart.dispatch();
	},

	/**
	 * When this function is called it will simply dispatch onProgress. It maybe useful for classes
	 * which extend LoaderBase to override this function.
	 *
	 * @method _dispatchProgress
	 * @protected
	 * @param {Number} value This is a value between 0-1 which is the percentage of the files load
	 */
	_dispatchProgress: function( value ) {

		this.onProgress.dispatch( value );
	},

	/**
	 * When this function is called it will simply dispatch onComplete. It maybe useful for classes
	 * which extend LoaderBase to override this function.
	 *
	 * @method _dispatchComplete
	 * @protected
	 */
	_dispatchComplete: function() {

		this.onComplete.dispatch( this.content );
	},

	/**
	 * When this function is called it will simply dispatch onError. It maybe useful for classes
	 * which extend LoaderBase to override this function.
	 *
	 * @method _dispatchComplete
	 * @protected
	 * @param {String} msg The error message we'll be dispatching
	 */
	_dispatchError: function( msg ) {

		this.onError.dispatch( msg );
	},

	/**
	 * This callback will be called when the XHR progresses in its load.
	 *
	 * @method _onProgress
	 * @protected
	 * @param  {XMLHttpRequestProgressEvent} ev This event contains data for the progress of the load
	 */
	_onProgress: function( ev ) {

		var loaded = ev.loaded || ev.position;
		var totalSize = ev.total || ev.totalSize;

		if( totalSize ) {

			this._dispatchProgress( loaded / totalSize );	
		} else {

			this._dispatchProgress( 0 );
		}
	},

	/**
	 * This function is called whenever the readyState of the XHR object changes.
	 *
	 * 	this.xhr.readyState == 2 //send() has been called, and headers and status are available
	 * 	this.xhr.readyState == 3 //Downloading; responseText holds partial data.
	 * 	this.xhr.readyState == 4 //Done
	 *
	 * You should also handle HTTP error status codes:
	 *
	 * 	this.xhr.status == 404 //file doesn't exist
	 * 
	 * @method _onStateChange
	 * @protected
	 */
	_onStateChange: function() {

		if( this.xhr.readyState > 1 ) {

			if( this.xhr.status == '200' ) {

				switch( this.xhr.readyState ) {

					//send() has been called, and headers and status are available
					case 2:

						this.fileMeta = new FileMeta( this.xhr.getAllResponseHeaders() );

						this._dispatchStart();
					break;

					//Downloading; responseText holds partial data.
					case 3:

						//todo progress could be calculated here if onprogress does not exist on XHR
						//this.onProgress.dispatch();
					break;

					//Done
					case 4:

						this._parseContent();

						if( this.cacheID ) {

							this._addToCache();	
						}
						
						this._dispatchComplete();
					break;
				}
			} else {

				this.xhr.onreadystatechange = undefined;
				this._dispatchError( this.xhr.status );
			}
		}
	},

	/**
	 * Calling this method will add the file loaded by this LoaderBase to the LoaderCache.
	 * 
	 * @method _addToCache
	 * @protected
	 */
	_addToCache: function() {

		LoaderCache.add( this.cacheID, this.content );
	},

	/**
	 * This function will grab the response from the content loaded and parse it out
	 * 
	 * @method _parseContent
	 * @protected
	 */
	_parseContent: function() {

		if( this.loadTypeSet || this.loadType == LoaderBase.typeText ) {

			this.content = this.xhr.response;
		} else {

			switch( this.loadType ) {

				case LoaderBase.typeArraybuffer:

					if( ArrayBuffer ) {

						this.content = UtilArrayBuffer.stringToArrayBuffer( this.xhr.response );
					} else {

						throw new Error( 'This browser does not support ArrayBuffer' );
					}
				break;

				case LoaderBase.typeBlob:

					if( Blob ) {

						if( !this.fileMeta ) {

							this.fileMeta = new FileMeta();
						}

						if( this.fileMeta.mime === null ) {

							this.fileMeta.mime = UtilHTTP.getMimeFromURL( this.url );	
						}
						
						this.content = new Blob( [ UtilArrayBuffer.stringToArrayBuffer( this.xhr.response ) ], { type: this.fileMeta.mime } );	
					} else {

						throw new Error( 'This browser does not support Blob' );
					}
				break;

				case LoaderBase.typeJSON:

					this.content = JSON.parse( this.xhr.response );
				break;

				case LoaderBase.typeDocument:

					//this needs some work pretty sure there's a better way to handle this
					this.content = this.xhr.response;
				break;

			}
		}
	}
});

function checkIfGoodValue() {

	return this.loadType == LoaderBase.typeText ||
		   this.loadType == LoaderBase.typeArraybuffer ||
		   this.loadType == LoaderBase.typeBlob ||
		   this.loadType == LoaderBase.typeJSON ||
		   this.loadType == LoaderBase.typeDocument;
}

function checkResponseTypeSupport() {

	return this.xhr.responseType !== undefined;
}

function checkAndSetType( xhr, loadType ) {

	xhr.responseType = loadType;

	return xhr.responseType == loadType;
}

LoaderBase.typeText = 'text';
LoaderBase.typeArraybuffer = 'arraybuffer';
LoaderBase.typeBlob = 'blob';
LoaderBase.typeJSON = 'json';
LoaderBase.typeDocument = 'document';

module.exports = LoaderBase;