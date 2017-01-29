const path = require('path')
const fs = require('fs')
const functs = require('functs')

const ex = module.exports = {}

// create .z1 directory
process.chdir(process.env.HOME)
try {
  fs.mkdirSync('.z1')
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}

try {
  fs.mkdirSync(['.', '.z1', 'z1'].join(path.sep))
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}


ex.dir = path.join(process.env.HOME, '.z1')

process.chdir(path.join(ex.dir, 'z1'))

// initiate global error handle function
require('./handle')

global.isResurrected = false

process.chdir(ex.dir)
