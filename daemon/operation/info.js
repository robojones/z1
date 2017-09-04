const AppStats = require('../lib/class/AppStats')
const Worker = require('../lib/class/Worker')
const states = Worker.states
const mergePorts = require('../lib/mergePorts')

module.exports = function info(config, command) {
  return new Promise(resolve => {
    const app = config.apps.find(app => app.name === command.app)

    if (!app) {
      throw new Error(`app "${command.app}" not found`)
    }

    const stats = new AppStats(app.dir)

    // add general information
    stats.name = app.name
    stats.reviveCount = app.reviveCount || 0

    const workers = Worker.workerList.filter(worker => worker.name === command.app)

    workers.forEach(worker => {
      // add worker states
      const state = states[worker.state].toLowerCase()
      stats[state]++
      // add ports
      stats.ports = mergePorts(stats.ports, worker.ports)
    })

    resolve(stats)
  })
}
