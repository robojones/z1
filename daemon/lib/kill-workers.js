const sendLogsToCLI = require('./send-logs-to-CLI.js')

/**
 * Kills all workers. Returns the number of killed workers.
 * @param {*} workers
 * @param {number} timeout
 * @param {string} signal
 * @param {*} connection
 * @returns {number}
 */
async function killWorkers(workers, timeout, signal, connection) {
  workers.forEach(worker => {
    log(`kill worker ${worker.id}, connected: ${worker.w.isConnected()}, dead: ${worker.w.isDead()}`)
  })
  const killed = workers.map(async worker => {
    if (worker.isConnected()) {
      const logs = sendLogsToCLI(worker, connection)
      const exit = worker.once('exit')

      if (worker.kill(signal, timeout)) {
        await exit
      }

      logs.stop()

      return true
    }
    return false
  })

  const result = await Promise.all(killed)

  return result.filter(w => w).length
}

module.exports = killWorkers
