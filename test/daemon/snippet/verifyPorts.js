const assert = require('assert')
describe('verifyPorts', function () {
  const verifyPorts = local('daemon/snippet/verifyPorts')

  beforeEach(function () {
    this.pack = {
      right: [8080, 1010],
      wrong: [100, 'wrong']
    }
  })

  it('should throw if a port is invalid', function () {
    assert.throws(() => {
      verifyPorts(this.pack, 'wrong')
    })
  })

  it('should not throw if the ports are valid', function () {
    verifyPorts(this.pack, 'right')

    assert(this.pack.right)
  })

  it('should set the port to [] if it is undefined', function () {
    verifyPorts(this.pack, 'none')

    assert(Array.isArray(this.pack.none) && !this.pack.none.length)
  })
})
