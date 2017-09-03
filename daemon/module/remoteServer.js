const net = require('net')
const path = require('path')
const StringDecoder = require('string_decoder').StringDecoder
const log = require('./log')

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
    const decoder = new StringDecoder()
    const message = []

    socket.json = (err, data) => {
      const res = {}

      if (err) {
        res.error = {
          message: err.message,
          stack: err.stack,
          code: err.code
        }
      } else {
        res.data = data
      }

      socket.end(JSON.stringify(res))
    }

    socket.on('error', handle)

    socket.once('data', chunk => {
      message.push(decoder.write(chunk))
    })

    socket.once('end', () => {
      message.push(decoder.end())

      try {
        let obj = JSON.parse(message.join(''))

        run(obj).then(data => {
          socket.json(null, data)
        }).catch(err => {
          socket.json(err)
        })
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
