const assert = require('assert')

describe('Tube', function () {
  const Tube = require('./../controller/class/Tube')

  it('should be a function (class)', function () {
    assert.strictEqual(typeof Tube, 'function')
  })

  describe('instance', function () {

    beforeEach(function () {
      this.tube = new Tube()
    })

    it('should pipe everything', function (cb) {
      this.tube.once('data', () => {
        cb()
      })

      this.tube.write('hallo')
    })
  })
})
