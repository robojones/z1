const path = require('path')
const fs = require('fs')

/**
 * @typedef config
 * @property {string} version
 * @property {Array} apps
 */

/**
 * Returns the config object.
 * @param {string} version - The current version of the daemon.
 * @returns {config}
 */
function getConfig(version) {
  const configFile = path.resolve('config.json')
  let config

  try {
    config = require(configFile)
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err
    }
  }

  function save() {
    const content = JSON.stringify(config, null, 2)
    fs.writeFileSync(configFile, content)
  }

  if (!config) {
    config = {
      version,
      apps: []
    }

    save()
  }

  config.save = save

  return config
}

module.exports = getConfig
