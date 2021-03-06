module.exports = each

function each(stream, onItem) {
  var callback, sync

  return function (cb) {
    callback = cb
    start()
  }

  function start() {
    do {
      sync = undefined
      stream.read(onRead)
      if (sync === undefined) sync = false
    } while (sync)
  }

  function onRead(err, item) {
    if (item === undefined) return callback(err)
    if (onItem) onItem(item)
    if (sync === undefined) sync = true
    else start()
  }
}
