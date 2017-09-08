const remoteServer = require('../lib/remoteServer')
const promisify = require('smart-promisify')
const xTime = require('x-time')

function exit() {
  async function closeAndExit(timeout = 10000) {
    const close = promisify(remoteServer.server.close, remoteServer.server)
    const closePromise = close()
    const timeoutPromise = xTime(timeout)

    await Promise.race([closePromise, timeoutPromise])

    process.exit()
  }

  closeAndExit().catch(handle)

  return Promise.resolve({})
}

module.exports = exit
