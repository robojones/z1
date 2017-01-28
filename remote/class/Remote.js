const BetterEvents = require('better-events')
const net = require('net')
const fs = require('fs')
const childProcess = require('child_process')
const path = require('path')
const StringDecoder = require('string_decoder').StringDecoder

class Remote extends BetterEvents {
  constructor(socketFile) {
    super()
    this.socketFile = socketFile
  }

  start(dir) {
    return this.send({
      name: 'start',
      dir: path.resolve(dir || '')
    })
  }

  stop(app, timeout) {
    return this.send({
      name: 'stop',
      app: app,
      timeout: timeout
    })
  }

  restart(app, timeout) {
    return this.send({
      name: 'restart',
      app: app,
      timeout: timeout
    })
  }

  list() {
    return this.send({
      name: 'list'
    })
  }

  ping() {
    return this.send({
      name: 'ping'
    })
  }

  exit() {
    return this.send({
      name: 'exit'
    })
  }

  send(object) {
    return new Promise((resolve, reject) => {
      const socket = net.connect(this.socketFile, () => {
        socket.end(JSON.stringify(object))

        const decoder = new StringDecoder()
        const message = []

        socket.once('data', chunk => {
          message.push(decoder.write(chunk))
        })

        socket.once('end', () => {
          message.push(decoder.end())

          try {
            let obj = JSON.parse(message.join(''))
            if(obj.error) {
              const err = new Error(obj.error.message)
              err.stack = obj.error.stack
              if(obj.error.code) {
                err.code = obj.error.code
              }
              reject(err)
            } else {
              resolve(obj.data)
            }
          } catch(err) {
            reject(err)
          }
        })

      })

      socket.on('error', err => {
        reject(err)
      })
    })
  }
}

module.exports = Remote
