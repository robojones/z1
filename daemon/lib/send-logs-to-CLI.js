const logs = require('./log')

function sendLogsToCLI(appname, connection) {
  const sendOutToCLI = chunk => connection && connection.stdout(chunk)
  const sendErrToCLI = chunk => connection && connection.stderr(chunk)

  const streams = logs.get(appname)

  streams.log.on('data', sendOutToCLI)
  streams.err.on('data', sendErrToCLI)

  function remove() {
    streams.log.removeListener('data', sendOutToCLI)
    streams.err.removeListener('data', sendErrToCLI)
  }

  return {
    remove
  }
}

module.exports = sendLogsToCLI

