exports.Concat = Concat

function Concat() {
  this.streams = []
}

Concat.prototype.read = function(cb) {
  var self = this

  if (this.current) return this.current.read(function(err, data) {
    if (err) return self.abort(), cb(err)
    if (data !== undefined) return cb(null, data)
    self.current == null
    self.read(cb)
  })

  if (this.streams.length == 0) return cb()

  this.current = this.streams.shift()
  this.read(cb)
}

Concat.prototype.abort = function(cb) {
  cb = cb || noop

  var streams = this.streams
  if (this.current) streams = streams.concat(this.current)
  var left = streams.length

  if (left == 0) return cb()

  for (var i = 0; i < streams.length; i++) {
    streams[i].abort(function() {
      left--
      if (left == 0) cb()
    })
  }
}

Concat.prototype.push = function(stream) {
  this.streams.push(stream)
}

exports.Writable = Writable

function Writable() {
  this.queue = []
}

Writable.prototype.read = function(cb) {
  if (this.queue.length) return cb(null, this.queue.shift())
  this._push = cb
}

Writable.prototype.abort = function(cb) {
  if (cb) cb()
}

Writable.prototype.write = function(data) {
  var push = this._push
  this._push = null
  if (push) return push(null, data)
  this.queue.push(data)
}

function noop() {}
