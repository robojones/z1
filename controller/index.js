const autoSave = require('save-on-change')

const init = require('./module/init')

const Worker = require('./class/Worker')
const createServer = require('./module/remoteServer')

const dir = init.dir

const config = autoSave('config.json', err => {
  if(err) {
    handle(err)
  }
})

if(!config.apps) {
  config.apps = []
}

process.chdir(dir)

const operation = {
  resurrect: require('./operation/resurrect'),
  start: require('./operation/start'),
  stop: require('./operation/stop'),
  restart: require('./operation/restart'),
  list: require('./operation/list'),
  ping: require('./operation/ping'),
  exit: require('./operation/exit')
}

const server = createServer('sick.sock', command => {
  console.log('run command', command)

  if(!operation.hasOwnProperty(command.name)) {
    return Promise.reject(new Error(`command ${command.name} not found`))
  }

  return operation[command.name](config, command)
})
