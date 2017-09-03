const xTime = require('x-time')
const verifyApp = require('./lib/verifyApp')
const z1 = require('..')
const {
  works,
  fails
} = require('./lib/command')

describe('z1 start', function () {
  this.timeout(15000)

  beforeEach(function () {
    this.apps = []
  })

  afterEach(async function () {
    for (let i = 0; i < this.apps.length; i += 1) {
      await z1.stop(this.apps[i])
    }
  })

  it('should start the basic app with all options', async function () {
    this.apps.push('huhn')
    await works('z1 start test-app/basic --name huhn --ports 5050 --workers 1 --output ~/asdf')

    await verifyApp('huhn', {
      ports: [5050],
      available: 1
    })
  })

  it('should start the basic app with the options from the package.json', async function () {
    this.apps.push('basic')
    await works('z1 start test-app/basic')

    await verifyApp('basic', {
      ports: [8080],
      available: 2
    })
  })

  it('should apply the devPorts and devWorkers', async function () {
    this.apps.push('basic')
    await z1.start('test-app/dev', [], {}, { NODE_ENV: 'development' })

    await verifyApp('basic', {
      ports: [8070],
      available: 1
    })
  })

  it('should start the ready app', async function () {
    this.apps.push('ready')
    await works('z1 start test-app/ready')

    await verifyApp('ready', {
      ports: [],
      available: 2
    })
  })

  it('should error if two names collide', async function () {
    this.apps.push('ready')
    await works('z1 start test-app/ready')
    await fails('z1 start test-app/ready')
  })

  it('should clean up after a crash during the start', async function () {
    await fails('z1 start test-app/error')
  })

  it('should revive workers', async function () {
    this.apps.push('crash')
    await works('z1 start test-app/crash')
    // one worker will crash two times after 100 and 200 ms.
    await xTime(3000)

    await verifyApp('crash', {
      available: 1,
      reviveCount: 2
    })
  })

  it('should not accept "z1" as appname', async function () {
    await fails('z1 start test-app/z1')
  })
})
