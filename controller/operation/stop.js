const Worker = require('./../class/Worker')
const once = require('better-events').once

/*
command {
  app,
  timeout
}
*/

module.exports = function stop(config, command) {
  return new Promise((resolve, reject) => {

    const timeout = +command.timeout || null

    const killed = Worker.workerList.map(worker => {
      if(worker.name === command.app) {
        if(worker.kill(timeout)) {
          return worker.once('exit')
        }
      }
    })

    Promise.all(killed).then(() => {
      let i = config.apps.findIndex(app => app.name === command.app)

      if(i !== -1) {
        config.apps.splice(i, 1)
      }

      resolve({
        name: command.app,
        killed: killed.length
      })
    }).catch(reject)
  })
}
