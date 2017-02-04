const once = require('better-events').once
const assert = require('assert')
const path = require('path')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/startWorkers')

/*
command {
  app,
  timeout
}
*/

module.exports = function restart(config, command) {
  return new Promise((resolve, reject) => {

    let timeout = 1000 * 30

    if(command.timeout) {
      if(isNaN(+command.timeout)) {
        timeout = null
      } else {
        timeout = +command.timeout
      }
    }

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
    const nameChanged = pack.name !== app.name
    if(nameChanged) {
      // check name
      if(config.apps.some(app => app.name === pack.name)) {
        throw new Error(`new name "${pack.name}" already in use`)
      }

      config.apps.push({
        dir: app.dir,
        name: pack.name
      })
    }

    // remember old workers
    const workers = Worker.workerList.filter(worker => worker.dir === app.dir)

    startWorkers(app.dir, pack).then(data => {

      // kill old workers
      const killed = workers.map(worker => {
        if(worker.kill(timeout)) {
          return worker.once('exit')
        }
      })

      return Promise.all(killed).then(() => {

        if(nameChanged) {
          // remove old version
          if(config.apps[i] === app) {
            config.apps.splice(i, 1)
          }
        }

        data.killed = killed.length
        resolve(data)
      })
    }).catch(reject)
  })
}
