var getExtension = require('./getExtension');
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
	xml: 'text/xml',
	//video
	mp4: 'video/mp4',
	ogg: 'video/ogg',
	ogv: 'video/ogg',
	webm: 'video/webm',
	//audio
	wav: 'audio/wav',
	mp3: 'audio/mpeg'
};

/**
 * This function will return a mime type based on a file extension or a url. For instance the file 'jpg' would return
 * 'image/jpeg'.
 *
 * @method getMimeFromURL
 * @param  {String} type File extension
 * @return {String} Mime type
 */
module.exports =  function( url ) {
	var ext = getExtension(url);
	var mime = FILE_MIME[ ext.toLowerCase() ];
	return mime || 'application/octet-stream';
};