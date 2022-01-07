const command = require('command-test')
const path = require('path')
const cliFile = path.resolve('cli/main.js')

function modify(cmd) {
	return cmd.replace(/z1/, `${cliFile}`)
}

/**
 * Executes a command. Throws if the exit code is not 0.
 * @param {string} cmd - The command.
 */
function works(cmd) {
	cmd = modify(cmd)
	return command.works(cmd)
}

/**
 * Executes a command. Throws an error if the exit code is 0.
 * @param {string} cmd - The command.
 */
function fails(cmd) {
	cmd = modify(cmd)
	return command.fails(cmd)
}

module.exports = {
	works,
	fails,
}
