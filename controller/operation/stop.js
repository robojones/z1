const Worker = require('./../class/Worker')

/*
command {
  app,
  timeout
}
*/

module.exports = function stop(config, command) {
  return new Promise((resolve, reject) => {

    const q = []
    let dir = null

    Worker.workerList.forEach(worker => {
      if(worker.name === command.app) {
        if(!dir) {
          dir = worker.dir
        }
        worker.kill(+command.timeout || null)
        q.push(worker.once('exit'))
      }
    })

    if(dir) {
      config.apps.splice(config.apps.indexOf(dir), 1)
    } else {
      throw new Error(`app ${command.app} not found.`)
    }

    Promise.all(q).then(() => {
      resolve({
        app: command.app,
        dir: dir,
        killed: q.length
      })
    })
  })
}
