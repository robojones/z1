const assert = require('assert')

const Worker = local('controller/class/Worker')
const killWorkers = test('snippet/killWorkers')

describe('restart (operation)', function () {

  const start = local('controller/operation/start')
  const restart = local('controller/operation/restart')
  const pack = local('example/package.json')

  beforeEach(function () {
    this.command = {
      app: pack.name,
      opt: {
        timeout: 100
      }
    }
    this.config = {
      apps: []
    }

    return start(this.config, {
      dir: local.resolve('example'),
      opt: {},
      args: [],
      env: {}
    })
  })

  afterEach(killWorkers)

  it('should export a function', function () {
    assert.strictEqual(typeof restart, 'function')
  })

  describe('with valid package.json', function () {
    it('should start n workers if n in package.json', function () {
      const workers = Worker.workerList.slice()

      return restart(this.config, this.command).then(data => {
        workers.forEach(worker => {
          assert(!Worker.workerList.includes(worker))
        })
        assert.strictEqual(Worker.workerList.length, pack.workers)
        assert.strictEqual(data.killed, Worker.workerList.length)
      })
    })
  })
})
