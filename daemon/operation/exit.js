const remoteServer = require('../lib/remoteServer')

module.exports = () => {
  function exit() {
    remoteServer.server.close(() => {
      process.exit()
    })

    return Promise.resolve({})
  }

  return exit
}
