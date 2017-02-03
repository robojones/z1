const assert = require('assert')
const killWorkers = test('snippet/killWorkers')
const path = require('path')

const Worker = local('controller/class/Worker')

const cpuCount = require('os').cpus().length
const exampleServer = path.join(process.env.PWD, 'example')
const examplePackage = require(path.join(exampleServer, 'package.json'))

describe('start (module)', function () {

  const start = local('controller/module/start')

  beforeEach(function () {
    this.pack = Object.assign({}, examplePackage)
  })

  afterEach(killWorkers)

  it('should be a function', function () {
    assert.strictEqual(typeof start, 'function')
  })

  describe('if all values are correct', function () {
    it('should start n workers if workers is set to n', function () {
      this.pack.workers = 2
      return start(exampleServer, this.pack).then(() => {
        assert.strictEqual(Worker.workerList.length, this.pack.workers)
      })
    })

    it('should start n=cpuCount workers if workers is not set', function () {
      delete this.pack.workers
      return start(exampleServer, this.pack).then(() => {
        assert.strictEqual(Worker.workerList.length, cpuCount)
      })
    })
  })

  describe('if ports have a wrong value', function () {

    it('should throw if ports are not set', function (cb) {
      start(exampleServer, {
        name: 'exampleServer'
      }).then(() => {
        cb(new Error('this should not work'))
      }).catch(() => cb())
    })

    it('should throw if ports is an empty array', function (cb) {
      start(exampleServer, {
        name: 'exampleServer',
        ports: []
      }).then(() => {
        cb(new Error('this should not work'))
      }).catch(() => cb())
    })

    it('should throw if ports includes invalid values', function (cb) {
      start(exampleServer, {
        name: 'exampleServer',
        ports: [1000, 400, 'hallo']
      }).then(() => {
        cb(new Error('this should not work'))
      }).catch(() => cb())
    })
  })
})
