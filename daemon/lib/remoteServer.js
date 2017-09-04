const net = require('net')
const path = require('path')
const util = require('util')
const StringDecoder = require('string_decoder').StringDecoder

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
    let message = ''

    socket.json = (err, data) => {
      let res

      if (err) {
        res = {
          type: 'error',
          error: {
            message: err.message,
            stack: err.stack,
            code: err.code
          }
        }
      } else {
        res = {
          type: 'result',
          result: data
        }
      }

      socket.end(JSON.stringify(res))
    }

    socket.log = (...msg) => {
      const log = msg.map(part => util.inspect(part))

      const data = {
        type: 'log',
        log: log.join(' ')
      }

      socket.write(JSON.stringify(data))
    }

    socket.on('error', handle)

    socket.on('data', async chunk => {
      message += decoder.write(chunk)

      await parse()
    })

    socket.once('end', async () => {
      message += decoder.end()
      await parse()
    })

    async function parse() {
      const i = message.indexOf('\n')
      if (i === -1) {
        return
      }
      const msg = message.substr(0, i)
      message = message.substr(i + 1)

      try {
        const obj = JSON.parse(msg)

        const result = await run(socket, obj)
        socket.json(null, result)
      } catch (err) {
        socket.json(err)
      }

      await parse()
    }
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
