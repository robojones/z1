const util = require('util')
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

    this.socket.end(JSON.stringify(res) + '\n')
  }

  /**
   * Send a log to the CLI.
   * @param {*} msg - The message to log.
   */
  log(...msg) {
    const data = {
      type: 'log',
      log: logify(...msg)
    }

    this.socket.write(JSON.stringify(data) + '\n')
  }
}

module.exports = Connection
