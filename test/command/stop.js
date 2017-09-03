const z1 = require('../..')

const {
  works
} = require('../lib/command')

describe('stop', function () {
  it('should work even if the app is not running', async function () {
    await works('z1 stop asdf')
  })

  it('should kill all workers of the app', async function () {
    await z1.start('test-app/basic')
    await works('z1 stop basic')
  })

  it('should exit immediately if --immediate is set')

  it('should send the --signal after the --timeout')
})
