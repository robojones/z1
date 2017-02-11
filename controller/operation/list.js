const Worker = require('./../class/Worker')

const states = ['pending', 'available', 'killed']

module.exports = function list(config) {
  return new Promise((resolve, reject) => {

    const stats = {}

    config.apps.forEach(app => {
      stats[app.name] = {
        dir: app.dir,
        pending: 0,
        available: 0,
        killed: 0
      }
    })

    Worker.workerList.forEach(w => {
      stats[w.name][states[w.state]]++
    })

    resolve(stats)
  })
}
