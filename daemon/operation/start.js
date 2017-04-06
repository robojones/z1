const path = require('path')
const fs = require('fs')
const cluster = require('cluster')

const Worker = require('./../class/Worker')
const startWorkers = require('./../module/startWorkers')
const verifyPorts = require('./../snippet/verifyPorts')

/*
command: start {
  dir // absolute path to dir
  opt: {
    name
    ports
    workers
    output
  },
  args
  env
}
*/

module.exports = function start(config, command) {
  return new Promise((resolve, reject) => {
    if(global.isResurrectable) {
      global.isResurrectable = false
      config.apps = []
    }

    const packPath = require.resolve(path.join(command.dir, 'package.json'))
    // (re-)load package
    delete require.cache[packPath]
    const originalPackage = require(packPath)

    const pack = Object.assign({}, originalPackage, command.opt)

    if(command.env === 'development') {
      // apply devPorts
      verifyPorts(pack, 'devPorts')
      pack.ports = command.opt.ports || pack.devPorts || pack.ports
    }

    // check for duplicate name
    if(config.apps.some(app => app.name === pack.name)) {
      throw new Error(`an app called "${pack.name}" is already running.`)
    }

    config.apps.push({
      dir: command.dir,
      name: pack.name,
      args: command.args,
      opt: command.opt,
      env: command.env
    })

    return startWorkers(config, command.dir, pack, command.args, command.env).then(resolve).catch(err => {

      // remove app from config
      const i = config.apps.findIndex(app => app.name === pack.name)
      if(i !== -1) {
        config.apps.splice(i, 1)
      }

      reject(err)
    })
  })
}