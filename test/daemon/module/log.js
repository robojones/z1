const assert = require('assert')

describe('log', function () {
  describe('global.handle(error)', function () {
    it('should throw no error', function () {
      handle(new Error('this error is only a test error'))
    })
  })

  describe('global.log(...log)', function () {
    it('should throw no error', function () {
      log('this is a test log', {
        test: true
      })
    })
  })
})
