const path = require('path')

const pack = require('./../package.json')

module.exports.string = `cli: ${pack.version}`
module.exports.cli = pack.version

try {
  const configPath = path.join(process.env.HOME, '.z1', 'config.json')
  const config = require(configPath)

  module.exports.string += '\n'
  module.exports.string += `daemon: ${config.version}`
  module.exports.daemon = config.version
} catch(err) {}
