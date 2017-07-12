const assert = require('assert')

describe('remote', function () {
  const remote = local('remote/index')
  const Remote = local('remote/class/Remote')
  const exampleServer = local.resolve('example')

  it('should export an instance of Remote', function () {
    assert(remote instanceof Remote)
  })

  afterEach(function () {
    return remote.exit().then(() => log('should be killed'))
  })

  describe('.ping & .connect', function () {
    it('should be rejected if the daemon is not started', function (cb) {
      remote.exit().then(() => {
        return remote.ping().then(() => {
          cb(new Error('how could this ever resolve??'))
        }).catch(() => {
          cb()
        })
      })
    })

    it('should be resolved, when the daemon ist started', function () {
      return remote.connect().then(() => {
        return remote.ping()
      })
    })
  })

  describe('start-restart-stop cycle', function () {
    return remote.start(exampleServer).then(data => {
      return remote.list().then(list => {
        assert(list.stats[data.app], 'app not in the list')
        assert.strictEqual(list.stats[data.app].available, data.started, 'wrong number of workers')
        return remote.restart(data.app, {
          timeout: 100
        })
      })
    }).then(data => {
      return remote.list().then(list => {
        assert(list.stats[data.app], 'app not in the list')
        assert.strictEqual(list.stats[data.app].available, data.started, 'wrong number of workers')
        return remote.stop(data.app, {
          timeout: 100
        })
      })
    }).then(() => {
      return remote.list().then(list => {
        assert(!Object.keys(list.stats).length, 'there are workers left in the list')
      })
    }).catch(err => console.log(err))
  })
})
