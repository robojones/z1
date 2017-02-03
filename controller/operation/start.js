const path = require('path')
const fs = require('fs')
const cluster = require('cluster')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/startWorkers')

/*
command: start {
  dir // absolute path to dir
}
*/

module.exports = function start(config, command) {
  return new Promise((resolve, reject) => {

    // check for duplicate path
    if(config.apps.some(app => app.dir === command.dir)) {
      throw new Error(`app in directory "${command.dir}" already running`)
    }

    const pack = require(path.join(command.dir, 'package.json'))

    // check for duplicate name
    if(config.apps.some(app => app.name === pack.name)) {
      throw new Error(`an app called "${pack.name}" is already running.`)
    }

    config.apps.push({
      dir: command.dir,
      name: pack.name
    })

    return startWorkers(command.dir, pack).then(resolve).catch(err => {
      const i = config.apps.findIndex(app => app.name === pack.name)
      if(i !== -1) {
        config.apps.splice(i, 1)
      }
      reject(err)
    })
  })
}
