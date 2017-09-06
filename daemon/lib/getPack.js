const path = require('path')
const verifyPorts = require('./verifyPorts')

function getPack(dir, opt, env) {
  // reload package.json
  const packPath = path.join(dir, 'package.json')
  delete require.cache[packPath]
  const originalPackage = require(packPath)
  const pack = Object.assign({}, originalPackage, opt)

  // name
  if (!pack.name) {
    throw new Error('name in package.json must be set')
  }

  if (opt.ports) {
    verifyPorts(opt, 'ports', 'options')
    pack.ports = opt.ports
  }

  verifyPorts(pack, 'ports')

  // set default value for ports
  pack.ports = pack.ports || []

  // apply dev*
  if (env.NODE_ENV === 'development') {
    // apply devPorts
    verifyPorts(pack, 'devPorts')
    pack.ports = pack.devPorts || pack.ports
    // apply devWorkers
    pack.workers = opt.workers || pack.devWorkers || originalPackage.workers
  }

  return pack
}

module.exports = getPack
