const autoSave = require('save-on-change')

const init = require('./module/init')

const Worker = require('./class/Worker')
const createServer = require('./module/remoteServer')

const start = require('./operation/start')
const stop = require('./operation/stop')
const restart = require('./operation/restart')
const list = require('./operation/list')
const ping = require('./operation/ping')
const exit = require('./operation/exit')


const dir = init.dir

const config = autoSave('config.json', err => {
  if(err) {
    handle(err)
  }
})

if(!config.apps) {
  config.apps = []
}

config.apps.forEach(d => {
  start(null, {
    dir: d
  }).catch(handle)
})

process.chdir(dir)

const operation = {
  start: start,
  stop: stop,
  restart: restart,
  list: list,
  ping: ping,
  exit: exit
}

const server = createServer('sick.sock', command => {
  console.log('run command', command)

  if(!operation.hasOwnProperty(command.name)) {
    return Promise.reject(new Error(`command ${command.name} not found`))
  }

  return operation[command.name](config, command)
})
