const mergePorts = require('./mergePorts')

function verifyPorts(pack, prop, required) {

  if(Array.isArray(pack[prop])) {

    const numeralPorts = pack[prop].filter(p => typeof p === 'number')
    // remove duplicates
    const valid = mergePorts(numeralPorts)

    if(valid.length !== pack[prop].length) {
      if(required) {
        throw new Error(`invalid ${prop} in package.json`)
      } else {
        delete pack[prop]
      }
    }

  } else if(pack[prop] || required) {

    throw new Error(prop + ' in package.json must be an array')
  } else {

    delete pack[prop]
  }
}

module.exports = verifyPorts
