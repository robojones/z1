const z1 = require('..')

const { works } = require('./lib/command')
const {
  TIMEOUT,
  KILL_TIMEOUT
} = require('./lib/config')

describe('stop command', function () {
  this.timeout(TIMEOUT)

  it('should work even if the app is not running', async function () {
    await works('z1 stop asdf')
  })

  it('should kill all workers of the app', async function () {
    await z1.start('test-app/basic')
    await works(`z1 stop basic --timeout ${KILL_TIMEOUT}`)
  })

  it('should autodetect the appname from the directory if no appname is given', async function () {
    process.chdir('test-app/basic')

    await z1.start()
    await works(`z1 stop --timeout ${KILL_TIMEOUT}`)
  })

  it('should exit immediately if --immediate is set')
})
