const path = require('path')
const verifyPorts = require('./../snippet/verifyPorts')

function getPack(dir, opt, env) {

  // reload package.json
  const packPath = path.join(dir, 'package.json')
  delete require.cache[packPath]
  const originalPackage = require(packPath)
  const pack = Object.assign({}, originalPackage, opt)

  // apply devPorts
  if(env.NODE_ENV === 'development') {
    // apply devPorts
    verifyPorts(pack, 'devPorts')
    pack.ports = opt.ports || pack.devPorts || originalPackage.ports
  }

  return pack
}

module.exports = getPack
