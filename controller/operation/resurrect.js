const path = require('path')

const startWorkers = require('./../module/startWorkers')
const Worker = require('./../class/Worker')

global.isResurrectable = true

module.exports = function resurrect(config) {
  return new Promise((resolve, reject) => {

    if(!global.isResurrectable) {
      throw new Error('already resurrected')
    }

    global.isResurrectable = false

    const q = config.apps.map(app => {
      const originalPackage = require(path.join(app.dir, 'package.json'))
      const pack = Object.assign({}, originalPackage, app.opt)
      return startWorkers(app.dir, pack, app.args)
    })

    Promise.all(q).then(() => {
      resolve({
        started: Worker.workerList.length
      })
    }).catch(reject)
  })
}
