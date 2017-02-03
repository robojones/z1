const Worker = require('./../class/Worker')
const start = require('./start')
const once = require('better-events').once
const assert = require('assert')

/*
command {
  app,
  timeout
}
*/

module.exports = function restart(config, command) {
  return new Promise((resolve, reject) => {

    // find old app
    const i = config.apps.findIndex(app => app.name === command.app)

    if(i === -1) {
      throw new Error(`app "${command.app}" not found`)
    }

    const app = config.apps[i]

    // reload package.json
    packPath = path.join(app.dir, 'package.json')
    delete require.cache[packPath]
    const pack = require(packPath)

    // if name changed
    if(pack.name !== app.name) {
      // check name
      if(config.apps.some(app => app.name === pack.name)) {
        throw new Error(`new name "${pack.name}" already in use`)
      }

      app.name = pack.name
    }

    // remember old workers
    const workers = Worker.workerList.map(worker => worker.dir === app.dir)

    return startWorkers(command.dir, pack).then(data => {

      // kill old workers
      const timeout = +command.timeout || null

      const killed = Worker.workerList.map(worker => {
        if(worker.kill(timeout)) {
          return worker.once('exit')
        }
      })

      return Promise.all(killed).then(() => {
        resolve(data)
      })
    }).catch(reject)
  })
}
