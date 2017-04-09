const once = require('better-events').once
const assert = require('assert')
const path = require('path')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/startWorkers')

/*
command {
  app,
  opt: {
    timeout,
    signal
  }
}
*/

module.exports = function restart(config, command) {
  return new Promise((resolve, reject) => {

    if(global.isResurrectable) {
      throw new Error('no apps running')
    }

    // find old app
    const app = config.apps.find(app => app.name === command.app)

    if(!app) {
      throw new Error(`app "${command.app}" not found`)
    }

    // reload package.json
    packPath = path.join(app.dir, 'package.json')
    delete require.cache[packPath]
    const originalPackage = require(packPath)
    const pack = Object.assign({}, originalPackage, app.opt)

    // if name changed
    const nameChanged = pack.name !== app.name
    if(nameChanged) {
      // check name
      if(config.apps.some(app => app.name === pack.name)) {
        throw new Error(`new name "${pack.name}" already in use`)
      }

      // save new app
      config.apps.push(Object.assign({}, app, {
        name: pack.name
      }))
    }

    // set default timeout
    let timeout = (app.env.NODE_ENV === 'development') ? 0 : 30e3

    if(command.opt.timeout) {
      if(isNaN(+command.opt.timeout)) {
        timeout = null
      } else {
        timeout = +command.opt.timeout
      }
    }

    // apply devPorts
    if(command.env.NODE_ENV === 'development') {
      // apply devPorts
      verifyPorts(pack, 'devPorts')
      pack.ports = command.opt.ports || pack.devPorts || originalPackage.ports
    }

    // remember old workers
    const workers = Worker.workerList.filter(worker => worker.name === command.app)

    startWorkers(config, app.dir, pack, app.args, app.env).then(data => {

      // kill old workers
      const killed = workers.map(worker => {
        if(worker.kill(command.opt.signal, timeout)) {
          return worker.once('exit')
        }
      })

      return Promise.all(killed).then(() => {

        if(nameChanged) {
          // remove old version
          const oldIndex = config.apps.findIndex(app => app.name === command.app)
          config.apps.splice(oldIndex, 1)
        }

        data.killed = killed.length
        resolve(data)
      })
    }).catch(reject)
  })
}
