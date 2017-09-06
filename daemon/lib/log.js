const util = require('util')
const fs = require('fs')
const logify = require('./logify')

const LogManager = require('./class/LogManager')

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

  if (err.code === 'MODULE_NOT_FOUND') {
    throw err
  }
}

global.log = (...stuff) => {
  console.log(...stuff)
  z1Logs.log.write(logify(...stuff))

  z1Logs.log.write('\n')
}
