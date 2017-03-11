const Worker = require('./../class/Worker')

const states = ['pending', 'available', 'killed']

module.exports = function list(config) {
  return new Promise((resolve, reject) => {

    const stats = {}

    config.apps.forEach(app => {
      stats[app.name] = appStats(app.dir)
    })

    Worker.workerList.forEach(w => {
      if(!stats[w.name]) {
        stats[w.name] = appStats(w.dir)
      }
      
      stats[w.name][states[w.state]]++
    })

    resolve({
      isResurrectable: global.isResurrectable,
      stats: stats
    })
  })
}

function appStats(dir) {
  return {
    dir: dir,
    pending: 0,
    available: 0,
    killed: 0
  }
}
