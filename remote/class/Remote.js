const xTime = require('x-time')
const net = require('net')
const fs = require('fs')
const cp = require('child_process')
const path = require('path')
const promisify = require('smart-promisify')
const StringDecoder = require('string_decoder').StringDecoder

/**
 * A class representing a set of commands to control z1.
 * @class
 */
class Remote {
  /**
   * Create a new Remote instance.
   * @param {string} socketFile - Path to the socket file of the z1 daemon.
   */
  constructor(socketFile) {
    /** @type {string} */
    this.socketFile = socketFile
  }

  /**
   * Sends the "ready" signal to the z1 daemon.
   * @returns {Promise.<void>}
   */
  async ready() {
    if (typeof process.send !== 'function') {
      throw new Error('Can not send the "ready" signal to z1 because process.send() is not defined.')
    }

    console.log('ready signal sent')
    const send = promisify(process.send, process)
    await send('ready')
  }

  /**
   * @typedef resurrectResult
   * @property {number} started - Number of started workers.
   */

  /**
   * Start the apps that were started before exit.
   * @param {boolean} [immediate] -- Resolve the returned promise immediately after the command has been transmitted.
   * @returns {Promise.<resurrectResult>}
   */
  async resurrect(immediate = false) {
    this._impossibleInZ1()

    return this._connectAndSend({
      name: 'resurrect',
      immediate
    })
  }

  /**
   * @typedef appOptions
   * @property {string} [name] - The name of the app.
   * @property {number[]} [ports] - The prots that yoru app listens to.
   * @property {number} [workers] - The number of workers to start for your app. (default: number of CPUs)
   * @property {string} [output] - A directory for the log files. (default: ~/.z1/<appname>)
   */

  /**
   * @typedef startResult
   * @property {string} app - The name of the app.
   * @property {string} dir - The directory of the app.
   * @property {number} started - The number of started workers.
   * @property {number[]} ports - The ports that your app listens to.
   */

  /**
   * Start the app in the given directory.
   * @param {string} dir - Directory of the app.
   * @param {string[]} [args] - Arguments for the app.
   * @param {appOptions} [opt] - Options that overwrite the ones from the package.json.
   * @param {{string: string}} [env] - Environment variables for the app.
   * @param {boolean} [immediate] - Resolve the returned promise immediately after the command has been transmitted.
   * @returns {Promise.<startResult>}
   */
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

  /**
   * @typedef killOptions
   * @property {string} [signal] - The kill signal for the workers.
   * @property {number} [timeout] - The time (in ms) until the workers get force-killed.
   */

  /**
   * @typedef stopResult
   * @property {string} app - The name of the app.
   * @property {number} killed - The number of killed workers.
   */

  /**
   * Stop all workers of an app.
   * @param {string} app - The name of th app.
   * @param {killOptions} [opt] - Options for the command. 
   * @param {boolean} [immediateResolve] - Resolve the returned promise immediately after the command has been transmitted.
   * @returns {Promise.<stopResult>}
   */
  async stop(app, opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'stop',
      app,
      opt,
      immediate
    })
  }

  /**
   * @typedef restartResult
   * @property {string} app - The name of the app.
   * @property {string} dir - The directory of the app.
   * @property {number} started - The number of started workers.
   * @property {number} killed - The number of killed workers
   * @property {number[]} ports - The ports that your app listens to.
   */

  /**
   * Restart an app.
   * @param {string} app - The name of the app.
   * @param {killOptions} [opt] - Options for the command.
   * @param {boolean} [immediate] - Resolve the returned promise immediately after the command has been transmitted.
   * @returns {Promise.<restartResult>}
   */
  async restart(app, opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'restart',
      app,
      opt,
      immediate
    })
  }

  /**
   * @typedef restartAllResult
   * @property {number} started - The number of started workers.
   * @property {number} killed - The number of killed workers
   */

  /**
   * Restart all apps.
   * @param {killOptions} [opt] - Options for the command.
   * @param {boolean} [immediate] - Resolve the returned promise immediately after the command has been transmitted.
   * @returns {Promise.<restartAllResult>}
   */
  async restartAll(opt = {}, immediate = false) {
    opt.timeout = translateInfinity(opt.timeout)
    return this._connectAndSend({
      name: 'restart-all',
      opt,
      immediate
    })
  }

  /**
   * @typedef infoResult
   * @property {string} name - The name of the app.
   * @property {string} dir - Directory of the app.
   * @property {number[]} ports - Ports that the app uses.
   * @property {number} pending - Number of pending workers.
   * @property {number} available - Number of available workers.
   * @property {number} killed - Number of killed workers.
   * @property {number} reviveCount - Shows how often the app has been revived.
   */

  /**
   * Get detailed information about an app.
   * @param {string} app - The name of the app.
   * @returns {Promise.<infoResult>}
   */
  async info(app) {
    return this._connectAndSend({
      name: 'info',
      app
    })
  }

  /**
   * @typedef listAppStats
   * @property {string} dir - Directory of the app.
   * @property {number[]} ports - Ports that the app uses.
   * @property {number} pending - Number of pending workers.
   * @property {number} available - Number of available workers.
   * @property {number} killed - Number of killed workers.
   */

  /**
   * @typedef listResult
   * @property {boolean} isResurrectable - Is true if the resurrect command can be used.
   * @property {{string: listAppStats}} stats - Statistics for each app.
   */

  /**
   * Get a list of all running apps.
   * @returns {Promise.<listResult>}
   */
  async list() {
    return this._connectAndSend({
      name: 'list'
    })
  }

  /** 
   * Stop the z1 daemon.
   * @returns {Promise.<void>}
   */
  async exit() {
    await this._connectAndSend({
      name: 'exit'
    })

    await this._waitForDisconnect()
  }

  /**
   * Upgrade the z1 daemon to a new version. Do not call this in a child process of z1!
   * @returns {Promise.<void>}
   */
  async upgrade() {
    this._impossibleInZ1()

    await this.exit()
    await this.resurrect()
  }

  /**
   * Throws an error if called within a subprocess/worker of z1.
   * @returns {void}
   */
  _impossibleInZ1() {
    if (process.env.APPNAME && this.ready) {
      throw new Error('It is impossible to use this operation within apps that are managed with z1')
    }
  }

  /**
   * Returns a promise that resolves when the ping command was successful.
   * @returns {Promise.<void>}
   */
  async _ping() {
    await this._send({
      name: 'ping'
    })
  }

  /**
   * Returns a promise that resolves when the daemon is not available anymore.
   * @returns {Promise.<void>}
   */
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

  /**
   * Returns a promise that resolves as soon as the daemon is available.
   * @returns {Promise.<void>}
   */
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

  /**
   * Sends a command to the server.
   * @param {Object} object - An object representing the command.
   * @returns {Promise.<*>} - The result of the command.
   */
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

  /**
   * Sends a command to the daemon. It starts the daemon if it is not running.
   * @param {Object} object - An object representing the command.
   * @returns {Promise.<*>} - The result of the command.
   */
  async _connectAndSend(object) {
    await this._connect()
    return this._send(object)
  }

  /**
   * Tries to connect to the daemon. It starts the daemon if it is not running.
   * @returns {Promise.<void>}
   */
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

  /**
   * Start the daemon.
   * @returns {Promise.<void>} - Returns a promise that resolves after the daemon is started.
   */
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

/**
 * If the value equals infinity then "infinity" (string) is returned.
 * @param {string|number} value 
 * @returns {string|number}
 */
function translateInfinity(value) {
  if (value && !isFinite(+value)) {
    return 'infinity'
  }
  return value
}

module.exports = Remote
