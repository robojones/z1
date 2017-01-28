const Worker = require('./../class/Worker')

const states = ['pending', 'available', 'killed']

module.exports = function list() {
  return new Promise((resolve, reject) => {

    const stats = {}

    Worker.workerList.forEach(w => {
      if(!stats[w.name]) {
        stats[w.name] = {
          dir: w.dir,
          file: w.file,
          pending: 0,
          available: 0,
          killed: 0
        }
      }
      stats[w.name][states[w.state]]++
    })

    resolve(stats)
  })
}
