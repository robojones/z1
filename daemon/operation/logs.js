const log = require('../lib/log')

async function logs(config, command, connection) {
  const streams = log.get(command.app)
  const logString = msg => connection.log(msg.toString())

  streams.log.on('data', logString)
  streams.err.on('data', logString)

  return new Promise(resolve => {
    connection.on('message', msg => {
      if (msg.type === 'SIGINT') {
        streams.log.removeListener('data', logString)
        streams.err.removeListener('data', logString)
        resolve({})
      }
    })
  })
}

module.exports = logs
