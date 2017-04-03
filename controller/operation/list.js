const Worker = require('./../class/Worker')
const mergePorts = require('./../snippet/verifyPorts')

const states = ['pending', 'available', 'killed']

module.exports = function list(config) {
  return new Promise((resolve, reject) => {

    const stats = {}

    // show every started app (even if no workers are running)
    config.apps.forEach(app => {
      stats[app.name] = appStats(app.dir)
    })

    Worker.workerList.forEach(w => {
      // show stopped apps that have running workers
      if(!stats[w.name]) {
        stats[w.name] = appStats(w.dir)
      }

      const appStats = stats[w.name]

      // increase state counter
      appStats[states[w.state]]++

      // add ports
      appStats.ports = mergePorts(appStats.ports, w.ports)
    })

    resolve({
      isResurrectable: global.isResurrectable,
      stats: stats
    })
  })
}

function appStats(dir) {
  return {
    dir: dir,
    pending: 0,
    available: 0,
    killed: 0,
    ports: []
  }
}
