const Worker = require('../lib/class/Worker')
const killWorkers = require('../lib/killWorkers')
const sendLogsToCLI = require('../lib/send-logs-to-CLI.js')

/*
command {
  app,
  timeout
}
*/

async function stop(config, command, connection) {
  const app = config.apps.find(app => app.name === command.app)

  // transmit output to cli
  const logs = sendLogsToCLI(app.name, connection)

  let timeout = (app && app.env.NODE_ENV !== 'development') ? 30000 : 0

  if (command.opt.timeout) {
    if (isNaN(+command.opt.timeout)) {
      timeout = null
    } else {
      timeout = +command.opt.timeout
    }
  }

  const workers = Worker.workerList.filter(worker => worker.name === command.app)

  const workersKilled = await killWorkers(workers, timeout, command.opt.signal)

  let i = config.apps.findIndex(app => app.name === command.app)

  if (i !== -1) {
    // don't send output to cli anymore
    logs.stop()

    log.remove(config.apps[i].name)
    config.apps.splice(i, 1)
    config.save()
  }

  return {
    app: command.app,
    killed: workersKilled
  }
}

module.exports = stop
