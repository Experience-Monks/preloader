/**
 * @reference https://github.com/miguelmota/is-base64/pull/2
 */
module.exports = function isBase64 (v) {
  var regex = /^(data:\w+\/[a-zA-Z\+\-\.]+;base64,)?([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/gi;
  return regex.test(v);
};
