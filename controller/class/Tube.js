const Transform = require('stream').Transform

class Tube extends Transform {
  _transform(chunk, enc, cb) {
    cb(null, chunk)
  }
}

module.exports = Tube
