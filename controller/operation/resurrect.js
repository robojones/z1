const start = require('./start')
const Worker = require('./../class/Worker')

module.exports = function resurrect(config) {

  if(global.isResurrected) {
    return Promise.reject(new Error('already resurrected'))
  }

  global.isResurrected = true

  console.log(config)

  config.apps.forEach(d => {
    start(null, {
      dir: d
    }).catch(handle)
  })

  return Promise.resolve({
    apps: config.apps.length,
    started: Worker.workerList.length
  })
}
