const assert = require('assert')
const path = require('path')

const z1 = require('..')
const { works } = require('./lib/command')
const {
  TIMEOUT,
  KILL_TIMEOUT
} = require('./lib/config')

describe('info command', function () {
  this.timeout(TIMEOUT)

  before(async function () {
    await z1.start('test-app/basic', [], {
      workers: 1
    })
  })

  after(async function () {
    await z1.stop('basic', {
      timeout: KILL_TIMEOUT
    })
  })

  it('should not exit with an exit code', async function () {
    await works('z1 info basic')
  })

  describe('option', function () {
    /**
     * Test if the given option outputs the expected result
     * @param {string} optionName
     * @param {string} expectedResult
     */
    function checkOption(optionName, expectedResult) {
      describe(`--${optionName}`, function () {
        it(`should output the ${optionName} of the app`, async function () {
          const result = await works(`z1 info basic --${optionName}`)
          assert.strictEqual(result.out, expectedResult + '\n')
        })
      })
    }

    checkOption('available', '1')
    checkOption('dir', path.resolve('test-app/basic'))
    checkOption('killed', '0')
    checkOption('name', 'basic')
    checkOption('pending', '0')
    checkOption('ports', '8080')
    checkOption('revive-count', '0')
  })
})
