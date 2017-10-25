const OrigConnection = require('../../../lib/class/Connection')
const logify = require('../logify')

/**
 * Class representing a CLI connection.
 * @class
 */
class Connection extends OrigConnection {
  /**
   * Send a json response and close the socket.
   * @param {Error} error - An error if one occured.
   * @param {*} [result] - The result of the command.
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

    this.sendMessage(res)
    this.end()
  }

  /**
   * Send a log to the CLI.
   * @param {*} msg - The message to log.
   */
  log(...msg) {
    this.sendMessage({
      type: 'log',
      log: logify(...msg)
    })
  }

  /**
   * Transmits a chunk of data to the stdout stream of the CLI.
   * @param {string|Buffer} chunk - The chunk to transmit.
   */
  stdout(chunk) {
    this.sendMessage({
      type: 'stdout',
      chunk
    })
  }

  /**
   * Transmits a chunk of data to the stderr stream of the CLI.
   * @param {string|Buffer} chunk - The chunk to transmit.
   */
  stderr(chunk) {
    this.sendMessage({
      type: 'stderr',
      chunk
    })
  }
}

module.exports = Connection
