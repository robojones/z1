module.exports = function killWorkers(workers, timeout, signal) {
  const killed = workers.map(worker => {
    if (worker.kill(signal, timeout)) {
      return worker.once('exit')
    }
  }).filter(p => p)

  return Promise.all(killed)
}
