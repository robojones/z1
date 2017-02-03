const assert = require('assert')

const Worker = local('controller/class/Worker')
const killWorkers = test('snippet/killWorkers')

describe('start (operation)', function () {

  const start = local('controller/operation/start')
  const pack = local('example/package.json')

  beforeEach(function () {
    this.dir = local.resolve('example')
    this.command = {
      dir: this.dir
    }
    this.config = {
      apps: []
    }
  })

  afterEach(killWorkers)

  it('should export a function', function () {
    assert.strictEqual(typeof start, 'function')
  })

  describe('with valid arguments', function () {

    beforeEach(function () {
      return start(this.config, this.command)
    })

    it('should start workers', function () {
      assert(Worker.workerList.length)
    })

    it('should add the app to config.apps', function () {
      assert(this.config.apps.some(worker => {
        return worker.dir === this.dir && worker.name === pack.name
      }))
    })

    describe('started twice', function () {
      it('should not remove the app from apps', function () {
        return start(this.config, this.command).then(() => {
          throw new Error('no error was thrown')
        }).catch(err => {
          assert(this.config.apps.some(worker => worker.dir === this.dir))
        })
      })
    })
  })
})
