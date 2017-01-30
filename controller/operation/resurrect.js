const start = require('./start')
const Worker = require('./../class/Worker')

module.exports = function resurrect(config) {

  if(global.isResurrected) {
    return Promise.reject(new Error('already resurrected'))
  }

  global.isResurrected = true

  const q = config.apps.map(d => {
    return start(config, {
      dir: d
    }, true)
  })

  return Promise.all(q).then(() => {
    return {
      apps: config.apps.length,
      started: Worker.workerList.length
    }
  })
}
