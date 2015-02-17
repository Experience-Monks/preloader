	/**
 * This module should contain general utility methods.
 * 
 * @module utils
 */

/**
 * This utility class deals with file paths.
 * 
 * @class UtilPath
 * @static
 */
module.exports = {

	/**
	 * Return the file extension based on the path passed in. If the file does not have an extension null will be passed back
	 *
	 * @method getFileExtension
	 * @param {String} url URL we'd like a filextension from. This can be relative or absolute.
	 * @return {String} 
	 */
	getFileExtension: function( url ) {

		var splitByBackSlash = url.split( '/' );
		var fileData = /\.([a-zA-Z]+)/.exec( splitByBackSlash[ splitByBackSlash.length - 1 ] );
		
		return fileData[ 1 ] || null;	
	},

	getURLForDensity: function( url, densityModifiers ) {

		var regexFileExtension = /(\.\w+$)/;
		var pixelRatio = window.devicePixelRatio;
		var modifier = null;

		if( densityModifiers ) {

			var idx = pixelRatio - 1;
			modifier = densityModifiers[ idx ];

			while( ( modifier === undefined || modifier === null ) && idx >= 0 ) {

				modifier = densityModifiers[ idx ];

				idx--;
			}

			if( !modifier ) {

				modifier = densityModifiers[ 0 ];
			}

			if( typeof modifier == 'number' ) {

				modifier = '@' + modifier + 'x';
			}
		} else {

			modifier = '@' + pixelRatio + 'x';
		}
		

		return url.replace( regexFileExtension,  modifier + '$1' );
	}
};