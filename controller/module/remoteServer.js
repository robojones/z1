const net = require('net')
const fs = require('fs')
const path = require('path')
const StringDecoder = require('string_decoder').StringDecoder
const log = require('./log')

const OPT = {
  allowHalfOpen: true
}

module.exports = (filename, run) => {
  const file = path.resolve(filename)

  const server = net.createServer(OPT, socket => {
    const decoder = new StringDecoder()
    const message = []

    socket.json = (err, data) => {
      const res = {}

      if(err) {
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
      } catch(err) {
        socket.json(err)
      }
    })
  })

  server.listen(file)

  server.on('error', err => {
    handle(err)
    log.get('z1').stderr.once('close', () => {
      process.exit(1)
    })
    log.remove('z1')
  })

  return server
}
