const { BetterEvents } = require('better-events')
const util = require('util')
const { StringDecoder } = require('string_decoder')

/**
 * Class representing a CLI connection.
 * @class
 */
class Connection extends BetterEvents {
  /**
   * Create a new CLI connection.
   * @param {*} socket 
   */
  constructor(socket) {
    super()

    this.socket = socket
    this._message = ''

    const decoder = new StringDecoder()

    socket.on('data', async chunk => {
      this._message += decoder.write(chunk)

      this._parse()
    })

    socket.once('end', async () => {
      this._message += decoder.end()
      this._parse()
    })
  }

  /**
   * Parses this._message and emits the "message" event if one was received.
   */
  _parse() {
    const i = this._message.indexOf('\n')
    if (i === -1) {
      return
    }

    const msg = this._message.substr(0, i)
    this._message = this._message.substr(i + 1)

    try {
      const obj = JSON.parse(msg)

      this.emit('message', obj)
    } catch (error) {
      this.emit('error', error)
    }

    this._parse()
  }

  /**
   * Send a json response and close the socket.
   * @param {Error} error - An error if one occured.
   * @param {*} result - The result of the command.
   */
  json(error, result) {
    let res

    if (error) {
      res = {
        type: 'error',
        error: {
          message: error.message,
          stack: error.stack,
          code: error.code
        }
      }
    } else {
      res = {
        type: 'result',
        result
      }
    }

    this.socket.end(JSON.stringify(res) + '\n')
  }

  log(...msg) {
    const log = msg.map(part => util.inspect(part))

    const data = {
      type: 'log',
      log: log.join(' ')
    }

    this.socket.write(JSON.stringify(data) + '\n')
  }
}

module.exports = Connection
