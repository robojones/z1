const autoSave = require('save-on-change')
const path = require('path')
const fs = require('fs')

const Worker = require('./class/Worker')
const createServer = require('./module/remoteServer')

const z1Dir = path.join(process.env.HOME, '.z1')

try {
  fs.mkdirSync(z1Dir)
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}

process.chdir(z1Dir)

require('./module/log')

const config = autoSave('config.json', err => {
  if(err) {
    handle(err)
  }
})

if(!config.apps) {
  config.apps = []
}

const operation = {
  resurrect: require('./operation/resurrect'),
  start: require('./operation/start'),
  stop: require('./operation/stop'),
  restart: require('./operation/restart'),
  list: require('./operation/list'),
  ping: require('./operation/ping'),
  exit: require('./operation/exit')
}

console.log(process.cwd())

const server = createServer('sick.sock', command => {
  console.log('run command', command)

  if(!operation.hasOwnProperty(command.name)) {
    return Promise.reject(new Error(`command "${command.name}" not found`))
  }

  return operation[command.name](config, command)
})
