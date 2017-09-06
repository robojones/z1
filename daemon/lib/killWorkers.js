/**
 * Kills all workers. Returns the number of killed workers.
 * @param {*} workers 
 * @param {number} timeout 
 * @param {string} signal 
 * @returns {number}
 */
async function killWorkers(workers, timeout, signal) {
  const killed = workers.map(async worker => {
    if (worker.kill(signal, timeout)) {
      await worker.once('exit')
      return true
    }
    return false
  })

  const result = await Promise.all(killed)

  return result.filter(w => w).length
}

module.exports = killWorkers
