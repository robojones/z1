const assert = require('assert')
const fs = require('fs')
const util = require('util')

describe('handle', function () {

  const formatDate = local('controller/snippet/formatDate')
  const handle = local('controller/module/handle')

  afterEach(function (cb) {
    if(this.filename) {
      fs.unlink(this.filename, () => {
        cb()
      })
    } else {
      cb()
    }
  })

  it('should create a global functin called "handle"', function () {
    assert.strictEqual(typeof global.handle, 'function')
  })

  it('should create a file in the cwd', function (cb) {
    this.filename = `z1-error-${formatDate()}.txt`

    fs.readFile(this.filename, (err, content) => {
      if(err) {
        throw err
      }

      assert(!content.toString(), 'file not empty')
      cb()
    })
  })
})
