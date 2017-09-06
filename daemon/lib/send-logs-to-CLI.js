const logs = require('./log')

/**
 * Send logs to CLI.
 * @param {string} appname - The name of the app.
 * @param {*} connection - The connection to the CLI.
 */
function sendLogsToCLI(appname, connection) {
  const sendOutToCLI = chunk => connection && connection.stdout(chunk)
  const sendErrToCLI = chunk => connection && connection.stderr(chunk)

  const streams = logs.get(appname)

  streams.log.on('data', sendOutToCLI)
  streams.err.on('data', sendErrToCLI)

  /**
   * Stop sending logs to CLI.
   */
  function stop() {
    streams.log.removeListener('data', sendOutToCLI)
    streams.err.removeListener('data', sendErrToCLI)
  }

  return {
    stop
  }
}

module.exports = sendLogsToCLI

