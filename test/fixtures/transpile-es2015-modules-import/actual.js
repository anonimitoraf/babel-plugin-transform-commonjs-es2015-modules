var foo = require('bar');
var foo = require('bar').foo;
var foo = require('bar').baz;
module.exports = require('foo');
module.exports = foo;
module.exports.foo = require('bar');
module.exports.foo = bar;
exports.foo = require('bar');
exports.foo = bar;
