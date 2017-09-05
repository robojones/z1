const log = require('../lib/log')

async function logs(config, command, connection) {
  const streams = log.get(command.app)
  const sendOutToCLI = connection.stdout.bind(connection)
  const sendErrToCLI = connection.stderr.bind(connection)

  streams.log.on('data', sendOutToCLI)
  streams.err.on('data', sendErrToCLI)

  return new Promise(resolve => {
    connection.on('message', msg => {
      if (msg.type === 'SIGINT') {
        streams.log.removeListener('data', sendOutToCLI)
        streams.err.removeListener('data', sendErrToCLI)
        resolve({})
      }
    })
  })
}

module.exports = logs
