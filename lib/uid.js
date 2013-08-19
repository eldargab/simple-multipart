
module.exports = function uid(len) {
  var ret = ''
  var chars = 'abcdefghijklmnopqrstuvwxyz123456789'
  var nchars = chars.length
  while (len--) ret += chars[Math.random() * nchars | 0]
  return ret
}
