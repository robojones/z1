const logs = require('./log')

/**
 * Send logs to CLI.
 * @param {string|*} target - The name of the app. Or a worker.
 * @param {*} connection - The connection to the CLI.
 */
function sendLogsToCLI(target, connection) {
	const convert = chunk => Array.from(Buffer.from(chunk))
	const emit = (ev, chunk) => connection.remoteEmit(ev, convert(chunk))
	const sendOutToCLI = chunk => emit('stdout', chunk)
	const sendErrToCLI = chunk => emit('stderr', chunk)

	let streams

	if (typeof target === 'string') {
		streams = logs.get(target)

		streams.log.on('data', sendOutToCLI)
		streams.err.on('data', sendErrToCLI)
	} else {
		if (target.w && target.w.isConnected()) {
			const w = target.w

			w.process.stdout.on('data', sendOutToCLI)
			w.process.stderr.on('data', sendErrToCLI)
		}
	}

	return {
		/**
     * Stop sending logs to CLI.
     */
		stop() {
			if (typeof target === 'string') {
				streams.log.removeListener('data', sendOutToCLI)
				streams.err.removeListener('data', sendErrToCLI)
				return
			}

			if (target && target.w && target.w.process && target.w.process.stdout) {
				const w = target.w
				w.process.stdout.removeListener('data', sendOutToCLI)
				w.process.stderr.removeListener('data', sendErrToCLI)
			}
		},
	}
}

module.exports = sendLogsToCLI

