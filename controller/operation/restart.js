const Worker = require('./../class/Worker')
const start = require('./start')

/*
command {
  app,
  timeout
}
*/

module.exports = function restart(config, command) {
  const old = Worker.workerList.filter(worker => {
    return worker.name === command.app
  })

  if(!old.length) {
    return Promise.reject(new Error(`"${command.app}" not found.`))
  }

  command.dir = old[0].dir

  const q = []

  return start(null, command).then(data => {
    Worker.workerList.forEach(worker => {
      if(old.includes(worker)) {
        worker.kill(+command.timeout || null)
        q.push(worker.once('exit'))
      }
    })

    return Promise.all(q).then(() => {
      data.killed = q.length
      return data
    })
  })
}
