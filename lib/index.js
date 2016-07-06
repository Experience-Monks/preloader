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

var Preloader = new Class( {
	Extends: EventEmitter,
	/**
	*
	* Called on instantiation, sets up properties of Preloader object
	*
	* @method initialize 
	*
	*/

	initialize: function(options) {
		if (!(this instanceof Preloader)) return new Preloader(options);
		this.parent();
		this.options = this.parseOptions(options);
		if (this.options.onComplete) this.on('complete',this.options.onComplete);
		if (this.options.onProgress) this.on('progress',this.options.onProgress);
		this.percTotal = 0;
		this.loadIdx = 0;
		this.urls = [];
		this.loaders = {};
		this.percentageOfLoad = {};
		this.progress = 0;
		this.urlLoading = null;

		this._onLoadError = this._onLoadError.bind( this );
		this._onLoadProgress = this._onLoadProgress.bind( this );
		this._continueLoadQueue = this._continueLoadQueue.bind( this );
	},

	parseOptions: function(options) {
		return {
			xhrImages: options.xhrImages || false,
			loadFullAudio: options.loadFullAudio || false,
			loadFillVideo: options.loadFullVideo || false,
			onComplete: typeof options.onComplete === 'function' ? options.onComplete : undefined,
			onProgress: typeof options.onProgress === 'function' ? options.onProgress : undefined
		};
	},

	mergeOptions: function(options) {
		return {
			xhrImages: options.xhrImages || this.options.xhrImages,
			loadFullAudio: options.loadFullAudio || this.options.loadFullAudio,
			loadFillVideo: options.loadFullVideo || this.options.loadFullVideo,
			onComplete: typeof options.onComplete === 'function' ? options.onComplete : undefined,
			onProgress: typeof options.onProgress === 'function' ? options.onProgress : undefined
		}
	},

	/**
	*
	* Generic asset loader function - determines loader to be used based on file-extension
	*
	* @method add 
	* @param {String} url Base URL of asset
	*
	*/
	add: function( url, options ) {
		if (url) {
			this.addFromLoaderType( url, this._getLoader( url ), options );
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
	addImage: function( url, options ) {

		this.addFromLoaderType( url, LoaderImage, options );
	},

	/**
	*
	*Load JSON - uses the LoaderJSON loader
	*
	* @method addJSON 
	* @param {String} url Base URL of asset
	*
	*/
	addJSON: function( url, options ) {

		this.addFromLoaderType( url, LoaderJSON, options );
	},

	/**
	*
	*Load text - uses the LoaderText loader
	*
	* @method addText 
	* @param {String} url Base URL of asset
	*
	*/
	addText: function( url, options ) {

		this.addFromLoaderType( url, LoaderText, options );
	},

	/**
	*
	*Load video - uses the LoaderVideo loader
	*
	* @method addVideo 
	* @param {String} url Base URL of asset
	*
	*/
	addVideo: function( url, options ) {

		this.addFromLoaderType( url, LoaderVideo, options );
	},

	/**
	*
	*Load audio - uses the LoaderAudio loader
	*
	* @method addAudio 
	* @param {String} url Base URL of asset
	*
	*/
	addAudio: function( url, options ) {

		this.addFromLoaderType( url, LoaderAudio, options );
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
	addFromLoaderType: function( url, LoaderType, options ) {
		if(!this.loaders[ url ]) {
			this.loaders[ url ] = new LoaderType(this.mergeOptions(options));
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
	setPercentage: function( url, percentageOfLoad ) {

		this.percentageOfLoad[ url ] = percentageOfLoad;
	},

	/**
	*
	* Begins loading process
	*
	* @method load 
	*
	*/
	load: function() {

		if( this.urlLoading === null ) {

			this._setupPercentages();
			this._continueLoadQueue();
		}
	},

	/**
	*
	* Stops loading process
	*
	* @method stopLoad 
	*
	*/
	stopLoad: function() {

		if( this.urlLoading !== null ) {

			for( var i = 0, len = this.urls.length; i < len; i++ ) {

				this.loaders[ this.urls[ i ] ].stopLoad();
			}
		}
	},

	/**
	*
	* Retrieves loaded asset from loader 
	*
	* @method getContent 
	* @param {String} url Base URL of asset
	* @return asset instance
	*/
	get: function( url ) {

		return this.loaders[ url ] && this.loaders[ url ].content;
	},

	/**
	*
	* Loops through stated percentages of all assets and standardizes them
	*
	* @method _setupPercentages 
	*/
	_setupPercentages: function() {

		var percTotal = 0;
		var percScale = 1;
		var numWPerc = 0;
		var numWOPerc = 0;
		var oneFilePerc = 1 / this.urls.length;

		for( var i = 0, len = this.urls.length; i < len; i++ ) {

			if( this.percentageOfLoad[ this.urls[ i ] ] ) {

				percTotal += this.percentageOfLoad[ this.urls[ i ] ];
				numWPerc++;
			} else {

				numWOPerc++;
			}
		}

		if( numWOPerc > 0 ) {

			if( percTotal > 1 ) {

				percScale = 1 / percTotal;	
				percTotal *= percScale;
			}

			var percRemaining = 1 - percTotal;
			oneFilePerc = ( 1 - percTotal ) / numWOPerc;

			for( var i = 0, len = this.urls.length; i < len; i++ ) {

				if( this.percentageOfLoad[ this.urls[ i ] ] ) {

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
	_continueLoadQueue: function() {

		if( this.loadIdx < this.urls.length ) {

			//if we've just finished loading a file
			if( this.urlLoading !== null ) {

				this.percTotal += this.percentageOfLoad[ this.urlLoading ];
			}

			this.urlLoading = this.urls[ this.loadIdx ];
			var loader = this.loaders[ this.urlLoading ];

			this.loadIdx++;
			loader.on('progress', this._onLoadProgress );
			loader.once('error', this._onLoadError );
			loader.once('complete', this._continueLoadQueue );
			loader.load( this.urlLoading );
		} else {

			this.emit('complete');
		}
	},

	/**
	*
	* Logs error, updates progress, and continues the load
	*	
	*
	* @method _onLoadError 
	* @param {String} error Error message/type
	*/
	_onLoadError: function( error ) {

		console.warn( 'Couldn\'t load ' + this.urlLoading + ' received the error: ' + error );

		var curPerc = this.percentageOfLoad[ this.urlLoading ];

		this.emit('progress',this.percTotal + curPerc, this.urlLoading );

		this._continueLoadQueue();
	},

	/**
	*
	* Calculates progress of currently loading asset and dispatches total load progress
	*	
	*
	* @method _onLoadProgress 
	* @param {Number} progress Progress of currently loading asset
	*/
	_onLoadProgress: function( progress ) {

		var curPerc = this.percentageOfLoad[ this.urlLoading ] * progress;

		this.emit('progress',this.percTotal + curPerc, this.urlLoading);
	},

	/**
	*
	* Retrieves the appropriate loader util given the asset file-type 
	*	
	*
	* @method _getLoader 
	* @param {String} url Base URL of asset
	@return {Function} Chosen loader util function based on filetype/extension
	*/
	_getLoader: function( url ) {
		var extension = getExtension(url)
		var loader = LOADER_DEFAULT;

		if (extension && LOADERS[ extension.toLowerCase() ]) loader = LOADERS[ extension.toLowerCase() ];
		return loader;
	}
});

module.exports = Preloader;