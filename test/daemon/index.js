const fs = require('fs')
const path = require('path')

const wd = path.join(process.env.HOME, '.z1')

try {
  fs.mkdirSync(wd)
} catch(err) {
  if(err.code !== 'EEXIST') {
    throw err
  }
}
process.chdir(wd)

require('./class/index')
require('./module/index')
require('./operation/index')
require('./snippet/index')
