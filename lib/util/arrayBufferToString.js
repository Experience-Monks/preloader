/**
 * This function will convert an Array Buffer to a String
 *
 * @method arrayBufferToString
 * @param  {ArrayBuffer} buffer The ArrayBuffer we'd like to convert to a string
 * @return {String} The string representation of an ArrayBuffer
 */
module.exports = function (buffer) {
  return String.fromCharCode.apply(null, new Uint16Array(buffer));
};
