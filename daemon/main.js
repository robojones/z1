const autoSave = require('save-on-change')
const path = require('path')
const fs = require('fs')

const pack = require('./../package.json')
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
require('./module/log')

process.on('uncaughtException', handle)

const Worker = require('./class/Worker')
Worker.errorHandler = handle
const createServer = require('./module/remoteServer')

const config = autoSave('config.json', err => {
  if (err) {
    handle(err)
  }
})

config.version = pack.version

if (!config.apps) {
  config.apps = []
}

let operation = null

const server = createServer('sick.sock', command => {
  if (process.env.NODE_ENV === 'development') {
    log('daemon: run command', command.name)
  }

  if (!operation.hasOwnProperty(command.name)) {
    return Promise.reject(new Error(`invalid operation name "${command.name}"`))
  }

  if (command.immediate) {
    operation[command.name](config, command).catch(handle)
    return Promise.resolve({})
  }

  return operation[command.name](config, command)
})

operation = {
  resurrect: require('./operation/resurrect'),
  start: require('./operation/start'),
  stop: require('./operation/stop'),
  restart: require('./operation/restart'),
  'restart-all': require('./operation/restart-all'),
  info: require('./operation/info'),
  list: require('./operation/list'),
  ping: require('./operation/ping'),
  exit: require('./operation/exit')(server)
}

console.log('daemon: daemon started')
