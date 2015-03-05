/**
 * This module will contain everything related to preloading.
 * 
 * @module preloader
 * 
 */

var Class = require('js-oop');
var Signal = require('signals');
var UtilPath = require('./util/UtilPath');
var LoaderImage = require('./LoaderImage');
var LoaderText = require('./LoaderText');
var LoaderJSON = require('./LoaderJSON');

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
	gif: LoaderImage,
	json: LoaderJSON
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

	/**
	*
	* Called on instantiation, sets up properties of Preloader object
	*
	* @method initialize 
	*
	*/

	initialize: function() {

		this.percTotal = 0;
		this.loadIdx = 0;
		this.urls = [];
		this.modifiedURL = {};
		this.loaders = {};
		this.cacheID = {};
		this.percentageOfLoad = {};
		this.progress = 0;

		/**
		*
		* Sends updates on loading progress to other part of application (loading ui)
		*
		* @property onProgress 
		* @type Object
		*/
		this.onProgress = new Signal();
		
		/**
		*
		* Notifies loading completion to other part of application 
		*
		* @property onComplete 
		* @type Object
		*/
		this.onComplete = new Signal();
		this.urlLoading = null;

		this._onLoadError = this._onLoadError.bind( this );
		this._onLoadProgress = this._onLoadProgress.bind( this );
		this._continueLoadQueue = this._continueLoadQueue.bind( this );
	},


	/**
	*
	* Generic asset loader function - determines loader to be used based on file-extension
	*
	* @method add 
	* @param {String} url Base URL of asset
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] optional string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*
	*/
	add: function( url, modifiers, modifierFunction ) {

		this.addFromLoaderType( url, this._getLoader( url ), modifiers, modifierFunction );
	},

	/**
	*
	*Load image - uses the LoaderImage loader
	*
	* @method addImage 
	* @param {String} url Base URL of asset
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*
	*/
	addImage: function( url, modifiers, modifierFunction ) {

		this.addFromLoaderType( url, LoaderImage, modifiers, modifierFunction );
	},

	/**
	*
	*Load JSON - uses the LoaderJSON loader
	*
	* @method addJSON 
	* @param {String} url Base URL of asset
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*
	*/
	addJSON: function( url, modifiers, modifierFunction ) {

		this.addFromLoaderType( url, LoaderJSON, modifiers, modifierFunction );
	},

	/**
	*
	*Load text- uses the LoaderText loader
	*
	* @method addText 
	* @param {String} url Base URL of asset
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*
	*/
	addText: function( url, modifiers, modifierFunction ) {

		this.addFromLoaderType( url, LoaderText, modifiers, modifierFunction );
	},

	/**
	*
	* Load asset using custom loader
	*
	* @method addFromLoaderType 
	* @param {String} url Base URL of asset
	* @param {Function} loaderType Custom loader function
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*
	*/
	addFromLoaderType: function( url, loaderType, modifiers, modifierFunction ) {

		this.loaders[ url ] = new loaderType();

		this._setupURL( url, modifiers, modifierFunction );
	},

	/**
	*
	* Sets ID for asset in the cache for future retrieval
	*
	* @method setCacheID 
	* @param {String} url Base URL of asset
	* @param {String} cacheID New identifier of asset to be used in cache
	*
	*/
	setCacheID: function( url, cacheID ) {

		this.cacheID[ url ] = cacheID;
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
	getContent: function( url ) {

		return this.loaders[ url ] && this.loaders[ url ].content;
	},

	/**
	*
	* Stores base url, modifies it given the various pixel-density modifiers and stores the modified version as well
	*
	* @method _setupURL 
	* @param {String} url Base URL of asset
	* @param {Array} [modifiers] list of image pixel-densities to be made available 
	* @param {Function} [modifierFunction] string manipulation util to format url based on modifiers argument (i.e. if strings, ['@1','@2'])
	*/
	_setupURL: function( url, modifiers, modifierFunction ) {

		this.urls.push( url );
		
		//if we have a modifier function use it
		if( modifierFunction ) {

			this.modifiedURL[ url ] = modifierFunction( url, modifiers );
		//if we don't have a modifier function but we have modifiers use those instead (expect it to be dpi)
		} else if( modifiers ) {

			this.modifiedURL[ url ] = UtilPath.getURLForDensity( url, modifiers );
		} else {

			this.modifiedURL[ url ] = url;
		}
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
			var cacheID = this.cacheID[ this.urlLoading ];

			this.loadIdx++;
			loader.onProgress.add( this._onLoadProgress );
			loader.onError.addOnce( this._onLoadError );
			loader.onComplete.addOnce( this._continueLoadQueue );
			loader.load( this.modifiedURL[ this.urlLoading ], cacheID );
		} else {

			this.onComplete.dispatch();
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

		this.onProgress.dispatch( this.percTotal + curPerc, this.urlLoading );	

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

		this.onProgress.dispatch( this.percTotal + curPerc, this.urlLoading );
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

		var regexExtention = /\.(\w+)$/;
		var extensionValue = regexExtention.exec( url );
		var extension = extensionValue && extensionValue[ 1 ];
		var loader = null;

		if( extension ) {

			extension = extension.toLowerCase();

			loader = LOADERS[ extension ];
		}
		 
		if( !loader ) {

			loader = LOADER_DEFAULT;
		}

		return loader;
	}
});

module.exports = Preloader;