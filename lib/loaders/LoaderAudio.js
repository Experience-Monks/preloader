/**
 * This module will contain everything related to preloading.
 * 
 * @module preloader
 */
var Class = require('js-oop');
var LoaderBase = require('./LoaderBase');

/**
 * LoaderAudio will load an audio file. The content property will contain an audio tag
 * 
 * @class LoaderAudio
 * @constructor
 * @extends {LoaderVideo}
 */
var LoaderAudio = new Class( {
	Extends: LoaderVideo,
	initialize: function(options) {
		this.parent(options);
    this.loadType = LoaderBase.typeAudio;
	}
});

module.exports = LoaderAudio;