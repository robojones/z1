const z1 = require('../..')

const {
  works,
  fails
} = require('../lib/command')

describe('restart', function () {
  it('should throw the app is not running', async function () {
    await fails('z1 restart asdf')
  })

  it('should restart all workers of the app', async function () {
    this.apps.push('basic')
    await z1.start('test-app/basic')
    await works('z1 restart basic --timeout 10000')
  })

  it('should autodetect the appname from the directory if no appname is given', async function () {
    process.chdir('test-app/basic')

    this.apps.push('basic')
    await z1.start()
    await works('z1 restart --timeout 10000')
  })

  it('should exit immediately if --immediate is set')

  it('should send the --signal after the --timeout')
})
