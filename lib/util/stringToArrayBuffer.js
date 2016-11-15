/**
 * This will convert a string to an ArrayBuffer
 *
 * @method stringToArrayBuffer
 * @param  {String} string The string to convert to an array buffer
 * @return {ArrayBuffer} The string data which was converted into an ArrayBuffer
 */
module.exports = function (string) {
  var buf = new ArrayBuffer(string.length * 2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);

  for (var i = 0, strLen = string.length; i < strLen; i++) {
    bufView[ i ] = string.charCodeAt(i);
  }

  return buf;
};
