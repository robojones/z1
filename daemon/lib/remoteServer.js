const net = require('net')
const path = require('path')
const Connection = require('./class/Connection')
const z1 = require('../../remote')

const OPT = {
  allowHalfOpen: true
}

/**
 * Creates a UNIX server to communicate with the z1 API.
 * @param {string} filename - The name for the UNIX socket.
 * @param {function} run - A function that gets called every time an object is received.
 */
function remoteServer(filename, run) {
  const file = path.resolve(filename)

  const server = net.createServer(OPT, socket => {
    socket.on('error', handle)

    const connection = new Connection(socket)

    connection.on('error', error => {
      connection.json(error)
    })

    connection.on('message', async (data) => {
      if (data.type !== 'command') {
        return
      }

      try {
        const result = await run(data, connection)
        connection.json(null, result)
      } catch (err) {
        connection.json(err)
      }
    })
  })

  if (!global.test) {
    server.listen(file)
  }

  server.on('error', async err => {
    if (err.code !== 'EADDRINUSE') {
      handle(err)
      // try to restart server
      remoteServer(filename, run)
      return
    }

    const removed = await z1._removeDeadSocket()

    if (removed) {
      console.log('Removed and started.')
      remoteServer(filename, run)
    } else {
      console.log('Another daemon process ist running. Exiting with exit code 0.')
      process.exit(0)
    }
  })

  remoteServer.server = server
}

remoteServer.Connection = Connection

module.exports = remoteServer
