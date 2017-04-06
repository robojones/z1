const assert = require('assert')
const fs = require('fs')
const path = require('path')
const Writable = require('stream').Writable
const once = require('better-events').once

const Tube = local('daemon/class/Tube')

const exampleDir = path.resolve('testTemp')

describe('LogManager', function () {

  const LogManagerPath = local.resolve('daemon/class/LogManager')

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

      describe('returned object', function () {

        describe('.log', function () {

          it('should write into the log file', function (cb) {

            const stuff = this.logs.setup('hi', exampleDir)

            fs.readdir(exampleDir, (err, files) => {

              if(err) {
                cb(err)
                return
              }

              const filename = files.filter(f => f.includes('log'))[0]

              stuff.log.write('hallo')

              stuff.logStream.once('close', () => {
                fs.readFile(path.join(exampleDir, filename), (err, contents) => {
                  assert.strictEqual(contents.toString(), 'hallo')
                  cb(err)
                })
              })

              this.logs.remove('hi')
            })
          })
        })


        describe('.err', function () {

          it('should write into the error file', function (cb) {

            const stuff = this.logs.setup('hi', exampleDir)

            fs.readdir(exampleDir, (err, files) => {

              if(err) {
                cb(err)
                return
              }

              const filename = files.filter(f => f.includes('error'))[0]

              stuff.err.write('hallo')

              stuff.errStream.once('close', () => {
                fs.readFile(path.join(exampleDir, filename), (err, contents) => {
                  assert.strictEqual(contents.toString(), 'hallo')
                  cb(err)
                })
              })

              this.logs.remove('hi')
            })
          })
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

    describe('.remove(id)', function () {

      it('should delete the old object', function () {

        const obj = this.logs.setup('hi', exampleDir)
        this.logs.remove('hi')

        assert.notStrictEqual(obj, this.logs.get('hi'))
      })

      it('should close the old streams', function () {

        const stuff = this.logs.setup('hi', exampleDir)

        const q = []
        q.push(once(stuff.log, 'end'))
        q.push(once(stuff.err, 'end'))
        q.push(once(stuff.logStream, 'close'))
        q.push(once(stuff.errStream, 'close'))

        this.logs.remove('hi')

        return Promise.all(q)
      })
    })
  })
})
