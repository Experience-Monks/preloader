/**
 * Return the file extension based on the path passed in. If the file does not have an extension null will be passed back
 *
 * @method getExtension
 * @param {String} url URL we'd like a filextension from. This can be relative or absolute.
 * @return {String} 
 */
module.exports = function(url) {
	var splitByBackSlash = url.split( '/' );
	var fileData = /\.([a-zA-Z]+)/.exec( splitByBackSlash[ splitByBackSlash.length - 1 ] );
	return fileData[ 1 ] || null;	
};