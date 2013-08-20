var should = require('should')
var helpers = require('simple-stream-helpers')
var Form = require('..')

describe('Simple multipart', function() {
  var form

  beforeEach(function() {
    form = new Form
  })

  function expect(text) {
    var actual

    helpers.consume(form)(function(err, chunks) {
      if (err) throw err
      actual = chunks.map(function(chunk) {
        (typeof chunk == 'string' || Buffer.isBuffer(chunk)).should.be.true
        return chunk.toString()
      }).join('')
    })

    form.end()

    text = text.map(function(line) {
      if (line == '--boundary') return '--' + form.boundary
      return line
    }).join('\r\n')

    text.should.equal(actual)
  }

  it('Should work with string parts', function() {
    form.field('f', 'hello')
    expect([
      '--boundary',
      'Content-Disposition: form-data; name="f"',
      '',
      'hello'
    ])
  })

  it('Should work with buffer parts', function() {
    form.field('f', new Buffer('hello'))
    expect([
      '--boundary',
      'Content-Disposition: form-data; name="f"',
      '',
      'hello'
    ])
  })

  it('Should work with stream parts', function() {
    var stream = helpers.arraySource(['a', 'b', 'c'])
    form.field('f', stream)
    expect([
      '--boundary',
      'Content-Disposition: form-data; name="f"',
      '',
      'abc'
    ])
  })

  describe('Given a .filename option', function() {
    it('Should serialize part as an attachment', function() {
      form.field('a', 'b', {filename: 'folder/hello.html'})
      expect([
        '--boundary',
        'Content-Type: text/html',
        'Content-Disposition: attachment; name="a"; filename="hello.html"',
        '',
        'b'
      ])
    })

    it('.type option should have precedence over mime determined from extension', function() {
      form.field('a', 'b', {filename: 'folder/hello.html', type: 'text/plain'})
      expect([
        '--boundary',
        'Content-Type: text/plain',
        'Content-Disposition: attachment; name="a"; filename="hello.html"',
        '',
        'b'
      ])
    })
  })
})
