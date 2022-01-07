const z1 = require('..')
const { once } = require('better-events')
const { spawn } = require('child_process')
const {
	TIMEOUT,
	KILL_TIMEOUT,
} = require('./lib/config')

let daemon

before(async function () {
	// wait for the test-daemon to start

	this.timeout(TIMEOUT)
	daemon = spawn('./daemon/main.js', {
		stdio: 'inherit',
	})

	const connection = z1._waitForConnection()
	const error = once(daemon, 'error')

	await Promise.race([connection, error])
})

after(async function () {
	this.timeout(TIMEOUT)

	// wait for daemon to stop
	await Promise.all([z1.exit(), once(daemon, 'exit')])
})

beforeEach(function () {
	this.timeout(TIMEOUT)

	this.apps = []
	this.defaultWd = process.cwd()
})

afterEach(async function () {
	this.timeout(TIMEOUT)

	process.chdir(this.defaultWd)

	for (let i = 0; i < this.apps.length; i += 1) {
		await z1.stop(this.apps[i], {
			timeout: KILL_TIMEOUT,
		})
	}
})
