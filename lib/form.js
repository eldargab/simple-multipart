var mime = require('mime')
var uid = require('./uid')
var streams = require('./streams')

module.exports = Form

function Form() {
  this.boundary = uid(32)
  this.type = 'multipart/form-data; boundary=' + this.boundary
  this.length = 0
  this.stream = new streams.Concat
  this.writable = new streams.Writable
  this.stream.push(this.writable)
}

Form.prototype.writeBoundary = function() {
  var b = '--' + this.boundary + '\r\n'
  this.writeASCII(this.length == 0 ? b : '\r\n' + b)
}

Form.prototype.writeHeader = function(name, val) {
  this.writeASCII(name + ': ' + val + '\r\n')
}

Form.prototype.writeASCII = function(chunk) {
  this.write(chunk, chunk.length)
}

Form.prototype.write = function(chunk, length) {
  this.writable.write(chunk)
  this.addLength(length)
}

Form.prototype.writeStream = function(stream, length) {
  this.stream.push(stream)
  this.writable = new streams.Writable
  this.stream.push(this.writable)
  this.addLength(length)
}

Form.prototype.addLength = function(length) {
  if (this.length == null) return
  if (length == null) return this.length = null
  this.length += length
}

Form.prototype.field = function(name, val, opts) {
  opts = opts || {}
  var type = opts.type || opts.filename
  var disp = opts.filename
    ? 'attachment; name="' name + '"; filename="' + basename(opts.filename) + '";'
    : 'form-data; name="' + name + '"'

  this.writeBoundary()
  if (type) this.writeHeader('Content-Type', mime.lookup(type))
  this.writeHeader('Content-Disposition', disp)

  switch (typeof val) {
    case 'number':
    case 'string':
      val = ''+val
      this.write(val, Buffer.byteLength(val))
      break
    case 'object':
      if (Buffer.isBuffer(val)) {
        this.write(val, val.length)
      } else {
        this.writeStream(val, opts.length)
      }
  }
}

Form.prototype.end = function() {
  this.writable.write()
}

Form.prototype.read = function(cb) {
  this.stream.read(cb)
}

Form.prototype.abort = function(cb) {
  this.stream.abort(cb)
}
