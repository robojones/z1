const { fails } = require('./lib/command')
const { TIMEOUT } = require('./lib/config')

describe('invalid command', function () {
  this.timeout(TIMEOUT)

  it('should fail', async function () {
    await fails('z1 asdf')
  })
})
