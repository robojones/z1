const path = require('path')
const fs = require('fs')
const cluster = require('cluster')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/start')

/*
command: start {
  dir // absolute path to dir
}
*/

module.exports = function start(config, command) {
  return new Promise((resolve, reject) => {
    const pack = require(path.join(command.dir, 'package.json'))

    const exists = Worker.workerList.some(worker => worker.name === pack.name)
    if(exists) {
      throw new Error(`an app called "${command.name}" is already running.`)
    }

    return startWorkers(command.dir, pack).then(() => {

      config.apps.push(dir)
      resolve()
    }).catch(reject)
  })
}
