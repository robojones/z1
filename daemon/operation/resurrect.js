const startWorkers = require('./../module/startWorkers')
const Worker = require('./../class/Worker')
const getPack = require('./../module/getPack')

global.isResurrectable = true

module.exports = function resurrect(config) {
  return new Promise((resolve, reject) => {
    if (!global.isResurrectable) {
      throw new Error('already resurrected')
    }

    global.isResurrectable = false

    const q = config.apps.map(app => {
      const pack = getPack(app.dir, app.opt, app.env)

      return startWorkers(config, app.dir, pack, app.args, app.env)
    })

    Promise.all(q).then(() => {
      resolve({
        started: Worker.workerList.length
      })
    }).catch(reject)
  })
}
