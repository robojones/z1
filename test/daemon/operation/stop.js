const assert = require('assert')

const Worker = local('daemon/class/Worker')
const killWorkers = test('snippet/killWorkers')

describe('stop (operation)', function () {
  const start = local('daemon/operation/start')
  const stop = local('daemon/operation/stop')
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
    assert.strictEqual(typeof stop, 'function')
  })

  it('should kill all workers with the given name', function () {
    return stop(this.config, this.command).then(data => {
      assert(!Worker.workerList.some(worker => worker.name === pack.name), 'not all workers killed')

      assert.strictEqual(data.killed, pack.workers, 'killed different amout of workers than in package.json')
    })
  })

  it('should not be rejected if no workers found', function () {
    return stop(this.config, this.command).then(() => {
      return stop(this.config, this.command).then(data => {
        assert.strictEqual(data.killed, 0)
      })
    })
  })
})
