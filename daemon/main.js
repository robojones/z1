const path = require('path')
const fs = require('fs')
const getConfig = require('./lib/getConfig')

const pack = require('../package.json')
const z1Dir = path.join(process.env.HOME, '.z1')

try {
  fs.mkdirSync(z1Dir)
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw err
  }
}

process.chdir(z1Dir)

// setup global log functions
require('./lib/log')

process.on('uncaughtException', handle)

const Worker = require('./lib/class/Worker')
Worker.errorHandler = handle
const remoteServer = require('./lib/remoteServer')

const config = getConfig(pack.version)

let operation = null

remoteServer('sick.sock', (command, connection) => {
  if (process.env.NODE_ENV === 'development') {
    log('daemon: run command', command.name)
  }

  if (!operation.hasOwnProperty(command.name)) {
    return Promise.reject(new Error(`invalid operation name "${command.name}"`))
  }

  if (command.immediate) {
    operation[command.name](config, command, connection).catch(handle)
    return Promise.resolve({})
  }

  return operation[command.name](config, command, connection)
})

operation = {
  exit: require('./operation/exit')(),
  info: require('./operation/info'),
  list: require('./operation/list'),
  logs: require('./operation/logs'),
  ping: require('./operation/ping'),
  'restart-all': require('./operation/restart-all'),
  restart: require('./operation/restart'),
  resurrect: require('./operation/resurrect'),
  start: require('./operation/start'),
  stop: require('./operation/stop')
}

console.log('daemon: daemon started')
