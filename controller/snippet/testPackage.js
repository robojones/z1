function testPackage(pack) {

  // name given
  if(typeof pack.name !== 'string') {
    throw new Error('name in package.json must be a string')
  }

  // ports given
  const isArray = Array.isArray(pack.ports)
  let r = null

  if(isArray) {
    r = pack.ports.filter(port => {
      return typeof port === 'number'
    })
  }

  if(!isArray || !r.length || r.length !== pack.ports.length) {
    throw new Error('ports in package.json must be an array of numbers')
  }

  // main given
  if(typeof pack.main !== 'string') {
    throw new Error('main in package.json must be a string')
  }
}

module.exports = testPackage
