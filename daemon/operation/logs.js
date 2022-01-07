const sendLogs = require('../lib/send-logs-to-CLI')

async function logs(config, command, connection) {
	const logs = sendLogs(command.app, connection)

	return new Promise(resolve => {
		connection.on('SIGINT', () => {
			logs.stop()
			resolve({})
		})
	})
}

module.exports = logs
