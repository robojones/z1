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
  const killed = workers.map(async worker => {
    if (worker.kill(signal, timeout)) {
      const logs = sendLogsToCLI(worker, connection)
      await worker.once('exit')
      logs.stop()

      return true
    }
    return false
  })

  const result = await Promise.all(killed)

  return result.filter(w => w).length
}

module.exports = killWorkers
