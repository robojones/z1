const z1 = require('..')

const {
	works,
} = require('./lib/command')
const {
	TIMEOUT,
	KILL_TIMEOUT,
} = require('./lib/config')

describe('restart-all command', function () {
	this.timeout(TIMEOUT)

	it('should restart all workers of the app', async function () {
		this.apps.push('basic')
		await z1.start('test-app/basic')
		await works(`z1 restart-all --timeout ${KILL_TIMEOUT}`)
	})

	it('should exit immediately if --immediate is set')
})
