const z1 = require('../..')

const {
  works,
  fails
} = require('../lib/command')

describe('restart', function () {
  it('should throw the app is not running', async function () {
    await fails('z1 restart asdf')
  })

  it('should kill all workers of the app', async function () {
    await z1.start('test-app/basic')
    await works('z1 restart basic --timeout 10000')
  })

  it('should exit immediately if --immediate is set')

  it('should send the --signal after the --timeout')
})
