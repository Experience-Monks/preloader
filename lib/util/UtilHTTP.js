/**
 * This module should contain general utility methods.
 * 
 * @module utils
 */

var FILE_MIME = {

	//images
	gif: 'image/gif',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',

	//text
	html: 'text/html',
	css: 'text/css',
	csv: 'text/csv',
	xml: 'text/xml'
};

var UtilPath = require('./UtilPath');

/**
 * This utility class contains everything related to working with HTTP for instance: dealing with mimetypes, httpheaders, etc.
 * 
 * @class  UtilHTTP
 * @static
 */
module.exports = {

	/**
	 * If you pass a url to this function you'll get the mimetype associated with that url.
	 * The default is 'application/octet-stream'. The url can be relative or absolute.
	 *
	 * @method getMimeFromURL
	 * @param  {String} url The url you'd like to get a mimetype for.
	 * @return {String} Mimetype for the url passed in
	 */
	getMimeFromURL: function( url ) {

		return this.getMimeFromExtension( UtilPath.getFileExtension( url ) );	
	},

	/**
	 * This function will return a mime type based on a file extension. For instance the file 'jpg' would return
	 * 'image/jpeg'.
	 *
	 * @method getMimeFromExtension
	 * @param  {String} type File extension
	 * @return {String} Mime type
	 */
	getMimeFromExtension: function( type ) {

		var mime = FILE_MIME[ type.toLowerCase() ];

		return mime || 'application/octet-stream';
	},

	/**
	 * This function will take an HTTP header and turn it into an object for easier use.
	 *
	 * @method parseHeader
	 * @param  {String} headerString This is an HTTP header
	 * @return {Object} The return value will be an object representation of the HTTP Header
	 */
	parseHeader: function( headerString ) {

		var headerSplit = headerString.split( '\n' );
		var rVal = {};
		var regex = /([a-zA-Z0-9\-_]+): *(.+)/;
		var keyValue = null;

		for( var i = 0, len = headerSplit.length; i < len; i++ ) {

			//the end has an extra newline
			if( headerSplit[ i ] != '' ) {

				keyValue = regex.exec( headerSplit[ i ] );

				if( keyValue ) {

					rVal[ keyValue[ 1 ] ] = keyValue[ 2 ];
				}
			}
		}

		return rVal;
	}
};