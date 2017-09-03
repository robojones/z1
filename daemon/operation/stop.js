const Worker = require('./../class/Worker')
const killWorkers = require('./../module/killWorkers')
const log = require('./../module/log')

/*
command {
  app,
  timeout
}
*/

module.exports = function stop(config, command) {
  return new Promise((resolve, reject) => {
    const app = config.apps.find(app => app.name === command.app)

    let timeout = (app && app.env.NODE_ENV !== 'development') ? 30e3 : 0

    if (command.opt.timeout) {
      if (isNaN(+command.opt.timeout)) {
        timeout = null
      } else {
        timeout = +command.opt.timeout
      }
    }

    const workers = Worker.workerList.filter(worker => worker.name === command.app)
    const killed = killWorkers(workers, timeout, command.opt.signal)

    killed.then(() => {
      let i = config.apps.findIndex(app => app.name === command.app)

      if (i !== -1) {
        log.remove(config.apps[i].name)
        config.apps.splice(i, 1)
        config.save()
      }

      resolve({
        app: command.app,
        killed: workers.length
      })
    }).catch(reject)
  })
}
