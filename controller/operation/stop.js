const Worker = require('./../class/Worker')
const once = require('better-events').once

const log = require('./../module/log')

/*
command {
  app,
  timeout
}
*/

module.exports = function stop(config, command) {
  return new Promise((resolve, reject) => {

    let timeout = 1000 * 30

    if(command.timeout) {
      if(isNaN(+command.timeout)) {
        timeout = null
      } else {
        timeout = +command.timeout
      }
    }

    const killed = Worker.workerList.map(worker => {
      if(worker.name === command.app) {
        if(worker.kill(timeout)) {
          return worker.once('exit')
        }
      }
    }).filter(p => p)

    Promise.all(killed).then(() => {
      let i = config.apps.findIndex(app => app.name === command.app)

      if(i !== -1) {
        log.remove(config.apps[i].name)
        config.apps.splice(i, 1)
      }


      resolve({
        app: command.app,
        killed: killed.length
      })
    }).catch(reject)
  })
}
