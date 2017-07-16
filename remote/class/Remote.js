const BetterEvents = require('better-events')
const xTime = require('x-time')
const net = require('net')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const util = require('util')
const StringDecoder = require('string_decoder').StringDecoder

const sendMessage = (process.send) ? util.promisify(process.send) : null

class Remote extends BetterEvents {
  constructor(socketFile) {
    super()
    this.socketFile = socketFile
  }

  get ready() {
    return sendMessage
  }

  async resurrect(immediate = false) {
    this._impossibleInZ1()

    return this._connectAndSend({
      name: 'resurrect',
      immediate
    })
  }

  async start(dir, args = [], opt = {}, env = {}, immediate = false) {
    const envi = Object.assign({}, process.env, env)
    return this._connectAndSend({
      name: 'start',
      dir: path.resolve(dir || ''),
      args,
      opt,
      env: envi,
      immediate
    })
  }

  async stop(app, opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'stop',
      app,
      opt,
      immediate
    })
  }

  async restart(app, opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'restart',
      app,
      opt,
      immediate
    })
  }

  async restartAll(opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'restart-all',
      opt,
      immediate
    })
  }

  async info(app) {
    return this._connectAndSend({
      name: 'info',
      app
    })
  }

  async list() {
    return this._connectAndSend({
      name: 'list'
    })
  }

  async exit() {
    await this._connectAndSend({
      name: 'exit'
    })

    await this._waitForDisconnect()
  }

  async upgrade() {
    this._impossibleInZ1()

    await this.exit()
    await this.resurrect()
  }

  _impossibleInZ1() {
    if (process.env.APPNAME && this.ready) {
      throw new Error('It is impossible to use this operation within apps that are managed with z1')
    }
  }

  async _ping() {
    return this._send({
      name: 'ping'
    })
  }

  async _waitForDisconnect() {
    while (1) {
      try {
        await this._ping()
        await xTime(100)
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOENT') {
          break
        }
        throw err
      }
    }
  }

  async _waitForConnection() {
    while (1) {
      try {
        await this._ping()
        return
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'ENOENT') {
          await xTime(100)
          continue
        }
        throw err
      }
    }
  }

  async _send(object) {
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
            if (obj.error) {
              const err = new Error(obj.error.message)
              err.stack = obj.error.stack
              if (obj.error.code) {
                err.code = obj.error.code
              }
              reject(err)
            } else {
              resolve(obj.data)
            }
          } catch (err) {
            reject(err)
          }
        })
      })

      socket.on('error', reject)
    })
  }

  async _connectAndSend(object) {
    await this._connect()
    return this._send(object)
  }

  async _connect() {
    try {
      await this._ping()
      return
    } catch (err) {
      if (err.code !== 'ECONNREFUSED' && err.code !== 'ENOENT') {
        throw err
      }
    }

    try {
      fs.unlinkSync(this.socketFile)
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
    }

    await this._startDaemon()
  }

  async _startDaemon() {
    const start = new Promise((resolve, reject) => {
      const z1Path = path.join(__dirname, '..', '..')
      const file = path.join(z1Path, 'daemon', 'main.js')
      const node = process.argv[0]

      const p = cp.spawn(node, [file], {
        stdio: 'ignore',
        detached: true
      })

      p.once('error', reject)

      p.once('exit', code => {
        reject(new Error('daemon exited with code:', code))
      })

      p.unref()
    })

    await Promise.race([start, this._waitForConnection()])
  }
}

function translateInfinity(value) {
  if (value && !isFinite(+value)) {
    return 'infinity'
  }
  return value
}

module.exports = Remote
