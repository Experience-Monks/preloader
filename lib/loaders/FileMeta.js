var parseHTTPHeader = require('../util/parseHTTPHeader');

/**
 * FileMeta is a class which will hold file meta data. Each LoaderBase contains a FileMeta object
 * that you can use to query.
 *
 * @class FileMeta
 * @constructor
 * @param {String} header HTTP Header sent when loading this file
 */
var FileMeta = function (header) {
  /**
   * This property is the mimetype for the file
   *
   * @property mime
   * @type {String}
   */
  this.mime = null;

  /**
   * This is the file size in bytes
   *
   * @type {Number}
   */
  this.size = null;

  /**
   * This is a Date object which represents the last time this file was modified
   *
   * @type {Date}
   */
  this.lastModified = null;

  /**
   * This is the HTTP header as an Object for the file.
   *
   * @type {Object}
   */
  this.httpHeader = null;

  if (header) this.setFromHTTPHeader(header);
};

FileMeta.prototype = {

  /**
   * This function will be called in the constructor of FileMeta. It will parse the HTTP
   * headers returned by a server and save useful information for development.
   *
   * @method setFromHTTPHeader
   * @param {String} header HTTP header returned by the server
   */
  setFromHTTPHeader: function (header) {
    this.httpHeader = parseHTTPHeader(header);

    if (this.httpHeader[ 'content-length' ]) this.size = this.httpHeader[ 'content-length' ];

    if (this.httpHeader[ 'content-type' ]) this.mime = this.httpHeader[ 'content-type' ];

    if (this.httpHeader[ 'last-modified' ]) this.lastModified = new Date(this.httpHeader[ 'last-modified' ]);
  }
};

module.exports = FileMeta;
