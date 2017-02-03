const assert = require('assert')

describe('remote', function () {

  const remote = local('remote/index')
  const Remote = local('remote/class/Remote')

  it('should export an instance of Remote', function () {
    assert(remote instanceof Remote)
  })

  beforeEach(function () {
    //return remote.exit()
  })

  describe('.ping & .connect', function () {
    it('should be rejected if the daemon is not started', function (cb) {
      remote.exit().then(() => {
        return remote.ping()
          .then(() => {
            cb(new Error('how could this ever resolve??'))
          }).catch(err => {
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
})
