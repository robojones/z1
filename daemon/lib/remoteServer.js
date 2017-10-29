const net = require('net')
const path = require('path')
const fs = require('mz/fs')
const Connection = require('revents')
const z1 = require('../../remote')

const OPT = {
  allowHalfOpen: false
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
      connection.remoteEmit('error', error)
    })

    connection.on('command', async data => {
      try {
        const result = await run(data, connection)
        connection.remoteEmit('result', result)
      } catch (err) {
        connection.remoteEmit('error', err)
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

    const online = await z1._isOnline()

    if (online) {
      console.log('Another daemon process ist running. Exiting with exit code 0.')
      process.exit(0)
    } else {
      await fs.unlink(filename)
      console.log('Dead socket removed.')
      remoteServer(filename, run)
    }
  })

  remoteServer.server = server
}

remoteServer.Connection = Connection

module.exports = remoteServer
