const net = require('net')
const path = require('path')
const Connection = require('./class/Connection')

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
      try {
        const result = await run(data, socket)
        socket.json(null, result)
      } catch (err) {
        socket.json(err)
      }
    })
  })

  if (!global.test) {
    server.listen(file)
  }

  server.on('error', err => {
    handle(err)

    // try to restart server
    remoteServer(filename, run)
  })

  remoteServer.server = server
}

module.exports = remoteServer
