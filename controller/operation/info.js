const AppStats = require('./../class/AppStats')
const Worker = require('./../class/Worker')
const mergePorts = require('./../snippet/mergePorts')

module.exports = function info(config, command) {
  return new Promise((resolve, reject) => {

    const app = config.apps.find(app => app.name === command.app)

    if(!app) {
      throw new Error(`app "${command.app}" not found`)
    }

    const stats = new AppStats(app.dir)

    // add general information
    stats.name = app.name
    stats.reviveCount = app.reviveCount

    const workers = Worker.workerList.forEach(worker => worker.name === app.name)

    workers.forEach(worker => {
      // add worker states
      stats[worker.state] ++
      //add ports
      stats.ports = mergePorts(stats.ports, worker.ports)
    })

    resolve(stats)
  })
}
