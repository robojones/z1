const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Writable = require('stream').Writable

const Tube = local('controller/class/Tube')

const exampleDir = path.resolve('testTemp')

describe('LogManager', function () {

  const LogManagerPath = local.resolve('controller/class/LogManager')

  before(function (cb) {
    fs.mkdir(exampleDir, cb)
  })

  after(function (cb) {
    fs.readdir(exampleDir, (err, files) => {
      if(err) {
        cb(err)
        return
      }

      if(!files.length) {
        cb()
        return
      }

      files.forEach(file => {
        fs.unlink(path.join(exampleDir, file), err => {
          if(err) {
            cb(err)
            return
          }

          files.splice(files.indexOf(file), 1)

          if(!files.length) {
            fs.rmdir(exampleDir, cb)
          }
        })
      })
    })
  })

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

    describe('.get(id)', function () {

      it('should be a function', function () {
        assert.strictEqual(typeof this.logs.get, 'function')
      })

      it('should return the same every time', function () {
        assert.strictEqual(this.logs.get('hi'), this.logs.get('hi'))
      })

      describe('returned object', function () {

        it('should be an object', function () {
          assert(typeof this.logs.get('hi'), 'object')
        })

        it('should have all props', function () {

          const obj = this.logs.get('hi')

          assert(obj.hasOwnProperty('log'))
          assert(obj.hasOwnProperty('err'))
          assert(obj.log instanceof Tube)
          assert(obj.err instanceof Tube)
          assert(obj.hasOwnProperty('logStream'))
          assert(obj.hasOwnProperty('errStream'))
          assert(obj.hasOwnProperty('interval'))
        })
      })
    })

    describe('.setup(id, dir)', function () {

      it('should be a function', function () {
        assert.strictEqual(typeof this.logs.setup, 'function')
      })

      describe('returned object', function () {

        it('should be an object', function () {
          assert.strictEqual(typeof this.logs.setup('hi', exampleDir), 'object')
        })

        it('should create writeStreams for .log and .err', function () {

          const obj = this.logs.setup('hi', exampleDir)

          assert(obj.logStream instanceof Writable)
          assert(obj.errStream instanceof Writable)
        })

        it('should create two files', function () {
          const obj = this.logs.setup('hi', exampleDir)

          fs.readdir(exampleDir, files => {
            assert(files.length, 'no files created')
          })
        })
      })
    })
  })
})
