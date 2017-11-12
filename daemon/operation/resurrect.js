const startWorkers = require('../lib/start-workers')
const Worker = require('../lib/class/Worker')
const getPack = require('../lib/getPack')

global.isResurrectable = true

module.exports = function resurrect(config, command, connection) {
  return new Promise((resolve, reject) => {
    if (!global.isResurrectable) {
      throw new Error('already resurrected')
    }

    global.isResurrectable = false

    const q = config.apps.map(app => {
      const pack = getPack(app.dir, app.opt, app.env)

      return startWorkers(config, app.dir, pack, pack.workers, app.args, app.env, connection)
    })

    Promise.all(q).then(() => {
      resolve({
        app: '*',
        started: Worker.workerList.length
      })
    }).catch(reject)
  })
}
