/**
 * This module should contain general utility methods.
 * 
 * @module utils
 */

/**
 * UtilArrayBuffer utility class contains functions when working with ArrayBuffers
 *
 * @class UtilArrayBuffer
 * @static
 */
module.exports = {

	/**
	 * This function will convert an Array Buffer to a String
	 * 
	 * @method arrayBufferToString
	 * @param  {ArrayBuffer} buffer The ArrayBuffer we'd like to convert to a string
	 * @return {String} The string representation of an ArrayBuffer
	 */
	arrayBufferToString: function( buffer ) {

		return String.fromCharCode.apply(null, new Uint16Array(buf));
	},

	/**
	 * This will conver a string to an ArrayBuffer
	 * 
	 * @method stringToArrayBuffer
	 * @param  {String} string The string to convert to an array buffer
	 * @return {ArrayBuffer} The string data which was converted into an ArrayBuffer
	 */
	stringToArrayBuffer: function( string ) {

		var buf = new ArrayBuffer( string.length * 2 ); // 2 bytes for each char
		var bufView = new Uint16Array( buf );

		for (var i = 0, strLen = string.length; i < strLen; i++) {
			
			bufView[ i ] = string.charCodeAt( i );
		}

		return buf;
	}
};