const Worker = require('../lib/class/Worker')
const startWorkers = require('../lib/startWorkers')
const getPack = require('../lib/getPack')

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
    if (global.isResurrectable) {
      throw new Error('no apps running')
    }

    // find old app
    const app = config.apps.find(app => app.name === command.app)

    if (!app) {
      throw new Error(`app "${command.app}" not found`)
    }

    // reload package.json
    const pack = getPack(app.dir, app.opt, app.env)

    // if name changed
    const nameChanged = pack.name !== app.name
    if (nameChanged) {
      // check name
      if (config.apps.some(app => app.name === pack.name)) {
        throw new Error(`new name "${pack.name}" already in use`)
      }

      // save new app
      config.apps.push(Object.assign({}, app, {
        name: pack.name
      }))

      config.save()
    }

    // set default timeout
    let timeout = (app.env.NODE_ENV === 'development') ? 0 : 30e3

    if (command.opt.timeout) {
      if (isNaN(+command.opt.timeout)) {
        timeout = null
      } else {
        timeout = +command.opt.timeout
      }
    }

    // remember old workers
    const workers = Worker.workerList.filter(worker => worker.name === command.app)

    startWorkers(config, app.dir, pack, app.args, app.env).then(data => {
      // kill old workers
      const killed = workers.map(worker => {
        if (worker.kill(command.opt.signal, timeout)) {
          return worker.once('exit')
        }
      })

      return Promise.all(killed).then(() => {
        if (nameChanged) {
          // remove old version
          const oldIndex = config.apps.findIndex(app => app.name === command.app)
          config.apps.splice(oldIndex, 1)
          config.save()
        }

        data.killed = killed.length
        resolve(data)
      })
    }).catch(reject)
  })
}
