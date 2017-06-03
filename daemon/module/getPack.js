const path = require('path')
const verifyPorts = require('./../snippet/verifyPorts')

function getPack(dir, opt, env) {

  // reload package.json
  const packPath = path.join(dir, 'package.json')
  delete require.cache[packPath]
  const originalPackage = require(packPath)
  const pack = Object.assign({}, originalPackage, opt)

  // apply dev*
  if(env.NODE_ENV === 'development') {
    // apply devPorts
    verifyPorts(pack, 'devPorts')
    pack.ports = opt.ports || pack.devPorts || originalPackage.ports
    // apply devWorkers
    pack.workers = opt.workers || pack.devWorkers || originalPackage.workers
  }

  return pack
}

module.exports = getPack
