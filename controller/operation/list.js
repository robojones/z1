const Worker = require('./../class/Worker')
const states = Worker.states
const mergePorts = require('./../snippet/mergePorts')
const AppStats = require('./../class/AppStats')

module.exports = function list(config) {
  return new Promise((resolve, reject) => {

    const stats = {}

    // show every started app (even if no workers are running)
    config.apps.forEach(app => {
      stats[app.name] = new AppStats(app.dir)
    })

    Worker.workerList.forEach(worker => {
      // show stopped apps that have running workers
      if(!stats[worker.name]) {
        stats[worker.name] = new AppStats(worker.dir)
      }

      const appStats = stats[worker.name]

      // increase state counter
      const state = states[worker.state].toLowerCase()
      appStats[state]++

      // add ports
      appStats.ports = mergePorts(appStats.ports, worker.ports)
    })

    resolve({
      isResurrectable: global.isResurrectable,
      stats: stats
    })
  })
}
