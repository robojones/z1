const path = require('path')

const Remote = require('./class/Remote')

const z1socket = path.join(process.env.HOME, '.z1', 'sick.sock')

const z1 = new Remote(z1socket)

try {
  const config = require(path.join(process.env.HOME, '.z1', 'config.json'))
  const conf = config.apps[config.apps.findIndex(app => app.name === process.env.APPNAME)]
  const pack = require(path.join(conf.dir, 'package.json'))

  const app = Object.assign({}, pack, conf.opt, {
    dir: conf.dir
  })
  z1.app = app
} catch(err) {}

module.exports = z1
