const path = require('path')

const Remote = require('./class/Remote')

const z1socket = path.join(process.env.HOME, '.z1', 'sick.sock')

const z1 = new Remote(z1socket)

try {
  const apps = require(path.join(process.env.HOME, '.z1', 'config.json'))
  z1.apps = apps
  z1.app = apps[process.env.APPNAME]
} catch(err) {}

module.exports = z1
