const path = require('path')

const Remote = require('./class/Remote')

const z1socket = path.join(process.env.HOME, '.z1', 'sick.sock')

const z1 = new Remote(z1socket)

try {
  const config = require(path.join(process.env.HOME, '.z1', 'config.json'))
  const confApp = config.apps.find(app => app.name === process.env.APPNAME)
  const pack = require(path.join(confApp.dir, 'package.json'))

  // apply the actual ports
  pack.ports = process.env.PORTS.split(',').map(p => +p)

  const app = Object.assign({}, pack, confApp.opt)
  z1.app = app
} catch(err) {}

module.exports = z1
