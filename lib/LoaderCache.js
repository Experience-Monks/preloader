/**
 * This module will contain everything related to preloading.
 * 
 * @module preloader
 */

/**
 * LoaderCache is a cache where everything loaded with a LoaderBase where cache is true is saved for 
 * use later.
 *
 * For instace if a LoaderImage loads an image the Image is saved in LoaderCache for later use.
 * 
 * @type {Object}
 */
var LoaderCache = {

	/**
	 * The data object contains all saved data. Where they key of the object is the url and the value
	 * is the data cached.
	 * 
	 * @param data
	 * @type {Object}
	 */
	data: {},

	/**
	 * The get method will access the data object and grab the cached data for that url. Undefined will
	 * be returned if nothing is saved in the cache for that url.
	 * 
	 * @method get
	 * @param  {String} url This is the url for querying the cached value
	 * @return {Object} Data was cached or undefined if no data was cached for the url
	 */
	get: function( url ) {

		return this.data[ url ];
	},

	/**
	 * Call this function to check if there is cached content for the url passed in.
	 * 
	 * @method hasFile
	 * @param  {String} url This is the url for querying the cached value
	 * @return {Boolean} The return value will be true if the LoaderCache has a file and false if it doesn't
	 */
	hasFile: function( url ) {

		return this.data[ url ] !== undefined;
	},

	/**
	 * Use this function to add an item to the cache. 
	 * 
	 * @param {String} url This is the url to the cached item
	 * @param {Object} data The data for the cached item at the url passed in
	 */
	add: function( url, data ) {

		return this.data[ url ] = data; 
	},

	/**
	 * Use this function to remove an item from the cache
	 * 
	 * @param  {String} url This is the url to the cached item to remove
	 * @return {Boolean} True will be returned if an item was removed from the cache and false if it wasnt
	 */
	remove: function( url ) {

		var hadItem = data[ url ] !== undefined;

		this.data[ url ] = undefined;

		return hadItem;
	}
};

module.exports = LoaderCache;