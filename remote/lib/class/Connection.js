
const OrigConnection = require('../../../lib/class/Connection')

/**
 * Class representing a connection to the daemon.
 * @class
 */
class Connection extends OrigConnection {
  shareSIGINT() {
    process.on('SIGINT', () => {
      this.sendMessage({
        type: 'SIGINT'
      })
    })
  }
}

module.exports = Connection
