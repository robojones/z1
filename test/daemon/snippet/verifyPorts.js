const assert = require('assert')
describe('verifyPorts', function () {
  const verifyPorts = local('daemon/snippet/verifyPorts')

  beforeEach(function () {
    this.pack = {
      right: [8080, 1010],
      wrong: [100, 'wrong']
    }
  })

  describe('required', function () {

    it('should throw if it is invalid', function () {

      assert.throws(() => {
        verifyPorts(this.pack, 'wrong', true)
      })
    })

    it('should not throw if it is valid', function () {
      verifyPorts(this.pack, 'right')

      assert(this.pack.right)
    })
  })

  describe('!required', function () {

    it('should delete the ports array if it is invalid', function () {
      verifyPorts(this.pack, 'wrong')

      assert(!this.pack.wrong)
    })

    it('should not delete a valid array', function () {
      verifyPorts(this.pack, 'right')

      assert(this.pack.right)
    })
  })
})
