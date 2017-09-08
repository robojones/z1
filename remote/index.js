const path = require('path')

const Remote = require('./lib/class/Remote')

const z1socket = path.join(process.env.HOME, '.z1', 'sick.sock')

const z1 = new Remote(z1socket)

module.exports = z1
