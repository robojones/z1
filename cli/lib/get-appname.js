const path = require('path')
const assert = require('assert')
const { log } = require('./logs')

/**
 * Get the name of the app from the current cwd.
 * @returns string
 */
function getAppname() {
  log('no appname given')
  log('searching directory for package.json')
  try {
    const file = path.join(process.cwd(), 'package.json')
    const pack = require(file)
    assert(pack.name, 'name not specified in package.json')
    log(`found name "${pack.name}" in package.json`)
    return pack.name
  } catch (err) {
    console.error(`no package.json file found`)
    handle(new Error('missing argument `appname\''))
  }
}

module.exports = getAppname
