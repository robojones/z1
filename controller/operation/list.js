const Worker = require('./../class/Worker')
const mergePorts = require('./../snippet/mergePorts')
const AppStats = require('./../class/AppStats')

const states = ['pending', 'available', 'killed']

module.exports = function list(config) {
  return new Promise((resolve, reject) => {

    const stats = {}

    // show every started app (even if no workers are running)
    config.apps.forEach(app => {
      stats[app.name] = new AppStats(app.dir)
    })

    Worker.workerList.forEach(w => {
      // show stopped apps that have running workers
      if(!stats[w.name]) {
        stats[w.name] = new AppStats(w.dir)
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
