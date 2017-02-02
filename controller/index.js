const autoSave = require('save-on-change')
const path = require('path')

const Worker = require('./class/Worker')
const createServer = require('./module/remoteServer')

const dir = init.dir

try {
  process.chdir(process.env.HOME)
  mkdirSync('.z1')
  process.chdir(path.join(process.env.HOME, '.z1'))
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}

require('./module/logs')



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
    return Promise.reject(new Error(`command "${command.name}" not found`))
  }

  return operation[command.name](config, command)
})
