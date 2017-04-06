const assert = require('assert')

describe('Function: fill(string, space, length)', function () {
  const fill = local('daemon/snippet/fill')

  it('should be a function', function () {
    assert.strictEqual(typeof fill, 'function')
  })

  it('should fill up to the right length', function () {
    assert.strictEqual(fill('ello', 'h', 5), 'hello')
  })

  it('should return the string if its longer than length', function () {
    assert.strictEqual(fill('har har har', ' ', 3), 'har har har')
  })

  it('should throw a TypeError if space.length === 0', function () {
    try {
      fill('hi', '', 4)
    } catch(err) {
      assert(err instanceof TypeError)
    }
  })
})
