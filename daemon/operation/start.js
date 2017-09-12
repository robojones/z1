const startWorkers = require('../lib/start-workers')
const getPack = require('../lib/getPack')

/**
 * @typedef startOptions
 * @property {string} name - The name of the app.
 * @property {number[]} ports - An array of ports that the app uses.
 * @property {number} workers - The number of workers to spawn.
 * @property {string} output - The directory for the logs.
 */

/**
 * @typedef startCommandObject
 * @property {string} dir - The absolute path to the directory of the app.
 * @property {startOptions} opt - Options that overwrite the ones from the package.json.
 * @property {string[]} args - Arguments for the worker processes.
 * @property {{string: string}} env - Environment variables for the worker process.
 */

/**
 * Start the app specified in the command object.
 * @param {config} config - The z1-config-object.
 * @param {startCommandObject} command - An object containing the details of the command.
 */
async function start(config, command, connection) {
  if (global.isResurrectable) {
    global.isResurrectable = false
    config.apps = []
  }

  // (re)load package
  const pack = getPack(command.dir, command.opt, command.env)

  // check for duplicate name
  if (config.apps.some(app => app.name === pack.name)) {
    throw new Error(`an app called "${pack.name}" is already running.`)
  }

  config.apps.push({
    dir: command.dir,
    name: pack.name,
    args: command.args,
    opt: command.opt,
    env: command.env
  })
  config.save()

  try {
    return await startWorkers(config, command.dir, pack, command.args, command.env, connection)
  } catch (err) {
    // remove app from config

    const i = config.apps.findIndex(app => app.name === pack.name)
    if (i !== -1) {
      config.apps.splice(i, 1)
      config.save()
    }

    throw err
  }
}

module.exports = start
