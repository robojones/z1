const path = require('path')
const fs = require('fs')
const cluster = require('cluster')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/startWorkers')

/*
command: start {
  dir // absolute path to dir
  opt: {
    name
    ports
    workers
    output
  }
}
*/

module.exports = function start(config, command) {
  return new Promise((resolve, reject) => {
    if(global.isResurrectable) {
      global.isResurrectable = false
      config.apps = []
    }

    const originalPackage = require(path.join(command.dir, 'package.json'))
    const pack = Object.assign({}, originalPackage, command.opt)

    // check for duplicate name
    if(config.apps.some(app => app.name === pack.name)) {
      throw new Error(`an app called "${pack.name}" is already running.`)
    }

    config.apps.push({
      dir: command.dir,
      name: pack.name,
      args: command.args,
      opt: command.opt
    })

    return startWorkers(command.dir, pack, command.args).then(resolve).catch(err => {
      const i = config.apps.findIndex(app => app.name === pack.name)
      if(i !== -1) {
        config.apps.splice(i, 1)
      }
      reject(err)
    })
  })
}
