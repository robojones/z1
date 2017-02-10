const BetterEvents = require('better-events')
const xTime = require('x-time')
const net = require('net')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const StringDecoder = require('string_decoder').StringDecoder

class Remote extends BetterEvents {
  constructor(socketFile) {
    super()
    this.socketFile = socketFile
  }

  resurrect() {
    return this.connectAndSend({
      name: 'resurrect'
    })
  }

  start(dir, args = [], opt = {}) {
    return this.connectAndSend({
      name: 'start',
      dir: path.resolve(dir || ''),
      args: args,
      opt: opt
    })
  }

  stop(app, opt = {}) {
    opt.timeout = translateInfinity(opt.timeout)
    return this.connectAndSend({
      name: 'stop',
      app: app,
      opt: opt
    })
  }

  restart(app, opt = {}) {
    opt.timeout = translateInfinity(opt.timeout)
    return this.connectAndSend({
      name: 'restart',
      app: app,
      opt: opt
    })
  }

  list() {
    return this.connectAndSend({
      name: 'list'
    })
  }

  ping() {
    return this.send({
      name: 'ping'
    }, true)
  }

  exit() {
    return this.connectAndSend({
      name: 'exit'
    }).then(() => {
      const unPing = () => {
        return this.ping().then(() => {
          return xTime(100).then(() => {
            return unPing()
          })
        })
      }

      return unPing().catch(err => {
        if(err.code !== 'ECONNREFUSED') {
          throw err
        }
      })
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

  connectAndSend(object) {
    return this.connect().then(() => {
      return this.send(object)
    })
  }

  connect() {
    return this.ping().catch(err => {

      const ping = () => {
        return this.ping().catch(() => {
          return xTime(100).then(() => {
            return ping()
          })
        })
      }

      try {
        fs.unlinkSync(this.socketFile)
      } catch(err) {
        if(err.code !== 'ENOENT') {
          throw err
        }
      }

      const z1Path = path.join(__dirname, '..', '..')
      const file = path.join(z1Path, 'controller', 'index.js')
      const node = process.argv[0]

      return new Promise((resolve, reject) => {
        const p = cp.spawn(node, [file], {
          stdio: 'ignore',
          detached: true
        })
        p.on('error', reject)
        p.unref()

        ping().then(resolve).then(() => {
          this.emit('daemon')
        })
      })
    })
  }
}

function translateInfinity(value) {
  if(value && !isFinite(value)) {
    return "infinity"
  }
  return value
}

module.exports = Remote
