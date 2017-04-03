const verifyPorts = require('./verifyPorts')

function verifyPackage(pack) {

  // name
  if(!pack.name) {
    throw new Error('name in package.json must be set')
  }

  verifyPorts(pack, 'devPorts', false)
  verifyPorts(pack, 'ports', true)
}

module.exports = verifyPackage
