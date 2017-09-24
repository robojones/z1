const assert = require('assert')

const z1 = require('..')
const { works } = require('./lib/command')
const {
  TIMEOUT,
  KILL_TIMEOUT
} = require('./lib/config')

describe('list command', function () {
  this.timeout(TIMEOUT)

  before(async function () {
    await z1.start('test-app/basic', [], {
      workers: 1
    })

    await z1.start('test-app/basic', [], {
      workers: 1,
      name: 'asdf'
    })
  })

  after(async function () {
    await z1.stop('basic', {
      timeout: KILL_TIMEOUT
    })

    await z1.stop('asdf', {
      timeout: KILL_TIMEOUT
    })
  })

  it('should not exit with an exit code', async function () {
    await works('z1 list')
  })

  describe('-m, --minimal option', function () {
    it('should output names of all apps', async function () {
      const result = await works('z1 list -m')
      assert.strictEqual(result.out, 'basic asdf\n')
    })
  })
})
