const cluster = require('cluster')
const once = require('better-events').once

module.exports = function killWorkers() {
  const ids = Object.keys(cluster.workers)

  const exitQueue = ids.map(id => {
    const w = cluster.workers[id]
    w.kill()
    return once(w, 'exit')
  })

  return Promise.all(exitQueue)
}
