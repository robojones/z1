const {
  fails
} = require('../lib/command')

describe('invalid', function () {
  it('should fail', async function () {
    await fails('z1 asdf')
  })
})
