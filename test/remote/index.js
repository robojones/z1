const assert = require('assert')

describe('remote', function () {
  const remote = local('remote/index')
  const Remote = local('remote/class/Remote')
  const exampleServer = local.resolve('example')

  it('should export an instance of Remote', function () {
    assert(remote instanceof Remote)
  })

  afterEach(async function () {
    await remote.exit()
  })

  describe('.ping & .connect', function () {
    it('should be rejected if the daemon is not started', async function () {
      await remote.exit()
      try {
        await remote._ping()
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err
        }
        return
      }

      throw new Error('ping resolved where it could never resolve')
    })

    it('should be resolved, when the daemon ist started', async function () {
      await remote._connect()
      await remote._ping()
    })
  })

  describe('start-restart-stop cycle', async function () {
    let data = await remote.start(exampleServer)
    let list = await remote.list()

    assert(list.stats[data.app], 'app not in the list')
    assert.strictEqual(list.stats[data.app].available, data.started, 'wrong number of workers')

    data = await remote.restart(data.app, {
      timeout: 100
    })
    list = await remote.list()

    assert(list.stats[data.app], 'app not in the list')
    assert.strictEqual(list.stats[data.app].available, data.started, 'wrong number of workers')

    await remote.stop(data.app, {
      timeout: 100
    })
    list = await remote.list()

    assert(!Object.keys(list.stats).length, 'there are workers left in the list')
  })
})
