const { BetterEvents } = require('better-events')
const { StringDecoder } = require('string_decoder')

/**
 * Class representing a connection to the daemon.
 * @class
 */
class Connection extends BetterEvents {
  /**
   * Create a new connection to the daemon.
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

  get isDestroyed() {
    return !this.socket.writable
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
   * Writes a message to the socket. Returns true if the message was written to the socket.
   * @param {*} obj - The object to transmit.
   * @returns {boolean}
   */
  sendMessage(obj) {
    if (!obj.type) {
      throw new Error('Messages must have a type.')
    }

    if (this.isDestroyed) {
      return false
    }

    this.socket.write(JSON.stringify(obj) + '\n')
    return true
  }
}

module.exports = Connection
