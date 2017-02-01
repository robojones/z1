const assert = require('assert')

describe('LogManager', function () {

  const Tube = local('controller/class/Tube')
  const LogManagerPath = local.resolve('controller/class/LogManager')

  beforeEach(function () {
    this.LogManager = require(LogManagerPath)
  })

  afterEach(function () {
    delete require.cache[LogManagerPath]
  })

  it('should be a class (function)', function () {
    assert.strictEqual(typeof this.LogManager, 'function')
  })

  describe('instance', function () {

    beforeEach(function () {
      this.logs = new this.LogManager()
    })

    it('should be an object', function () {
      assert(typeof this.logs, 'object')
    })

    describe('.get', function () {

      it('should be a function', function () {
        assert.strictEqual(typeof this.logs.get, 'function')
      })

      it('should return an object', function () {
        const obj = this.logs.get()
        assert(obj.hasOwnProperty('log'))
        assert(obj.hasOwnProperty('err'))
        assert(obj.log instanceof Tube)
        assert(obj.err instanceof Tube)
        assert(obj.hasOwnProperty('logFile'))
        assert(obj.hasOwnProperty('errFile'))
        assert(obj.hasOwnProperty('interval'))
      })

      it('should return the same object every time', function () {
        assert.strictEqual(this.logs.get(), this.logs.get())
      })
    })

    describe('.setup', function () {

    })
  })
})
