const util = require('util')
const fs = require('fs')

const LogManager = require('./../class/LogManager')

const log = module.exports = new LogManager()

try {
  fs.mkdirSync('z1')
} catch (err) {
  if (err.code !== 'EEXIST') {
    throw err
  }
}

const z1Logs = log.setup('z1', 'z1')

global.handle = err => {
  console.error(err)
  z1Logs.err.write(util.inspect(err) + '\n')
}

global.log = (...stuff) => {
  console.log(...stuff)
  z1Logs.log.write(stuff.map(item => {
    if (typeof item === 'object' || typeof item === 'undefined') {
      return util.inspect(item)
    } else {
      return item
    }
  }).join(' '))

  z1Logs.log.write('\n')
}
