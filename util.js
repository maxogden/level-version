// Using "hex" to avoid binary encoding for browsers...
var bytewise = require("bytewise/hex")

module.exports = function(options) {
  if (typeof options === 'undefined') options = {}
  
  var encode = options.encode || defaultEncode
  var decode = options.decode || defaultDecode

  function makeKey(delimiter, key, version, value) {
    return [key, encode(version, key, value)].join(delimiter)
  }

  function unmakeKey(delimiter, key, value) {
    if (key == null) return {key: key}
    var parts = key.split(delimiter)
    // If this happens, who knows what's going on.
    if (parts.length <= 1) return {key: key}
    var version = parts.pop()
    key = parts.join(delimiter)
    version = decode(version, key, value)
    return {key: key, version: version}
  }

  function wrapCb(version, cb) {
    if (!cb) return

    return function () {
      var args = [].slice.call(arguments)
      if (args.length == 0) args.push(null)
      args.push(version)
      return cb.apply(null, args)
    }
  }

  // Returns versions are stored in reverse order (-version) because the most common stream is new->old
  // TODO -- make this optional, timestream does *not* want it.

  function defaultEncode(version) {
    return bytewise.encode(-version)
  }

  function defaultDecode(version) {
    return -bytewise.decode(version)
  }
  
  return {
    makeKey: makeKey,
    unmakeKey: unmakeKey,
    wrapCb: wrapCb
  }
}