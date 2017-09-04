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

  get isDestroyed() {
    return this.socket.destroyed
  }
}

module.exports = Connection
