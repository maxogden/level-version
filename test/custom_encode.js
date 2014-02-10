var crypto = require('crypto')
var test = require("tape").test

var level = require("level-test")()
var testdb = level("test-custom-encode", {valueEncoding: "json"})

var version = require("../")

var db = version(testdb, {encode: encode, decode: decode})

var bytewise = require("bytewise/hex")

function encode(version, key, value) {
  var encVer = bytewise.encode(-version)
  if (!value) return encVer
  if (value.toString() === '[object Object]' || Array.isArray(value)) value = JSON.stringify(value)
  return new Buffer(encVer + '-' + crypto.createHash('md5').update(value).digest("hex"))
}

function decode(version, key, value) {
  var parts = version.split('-')
  parts[0] = -bytewise.decode(parts[0])
  return parts
}

test("json encoding put no default version w/ custom encode", function (t) {
  db.put("pet", {foo: "bar"})
  t.end()
})

test("value is there w/ custom decode", function (t) {
  t.plan(2)
  db.get("pet", function (err, value, version) {
    t.deepEquals(value, {foo: "bar"})
    t.ok(version[0] >= Date.now() - 50 && version[0] < Date.now() + 1)
  })
})
