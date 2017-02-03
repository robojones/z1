const util = require('util')
const fs = require('fs')

const LogManager = require('./../class/LogManager')

const log = module.exports = new LogManager()

const z1Logs = log.get('z1')

try {
  fs.mkdirSync('z1')
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}

log.setup('z1', 'z1')

global.handle = err => {
  z1Logs.err.write(util.inspect(err) + '\n')
}

global.log = (...stuff) => {
  z1Logs.log.write(stuff.map(item => {
    if(typeof item === 'object' || typeof item === 'undefined') {
      return util.inspect(item)
    } else {
      return item
    }
  }).join(' '))

  z1Logs.log.write('\n')
}
