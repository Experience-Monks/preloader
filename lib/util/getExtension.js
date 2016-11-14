var base64Mime = require('base64mime');

var isBase64 = require('./isBase64');

/**
 * Return the file extension based on the path passed in. If the file does not have an extension null will be passed back
 *
 * @method getExtension
 * @param {String} url URL we'd like a filextension from. This can be relative or absolute.
 * @return {String}
 */
module.exports = function getExtension (url) {
  if (isBase64(url)) {
		mime = base64Mime(url);
		return mime;
	}

	var splitByBackSlash = url.split( '/' );
	var fileData = /\.([a-zA-Z0-9]+)/.exec( splitByBackSlash[ splitByBackSlash.length - 1 ] );

	return fileData[ 1 ] || null;
};
