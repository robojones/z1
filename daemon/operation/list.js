const Worker = require('../lib/class/Worker')
const states = Worker.states
const mergePorts = require('../lib/mergePorts')

module.exports = function list(config) {
  return new Promise(resolve => {
    const stats = {}

    /**
     * @typedef appStats
     * @property {string} dir
     * @property {number} pending
     * @property {number} available
     * @property {number} killed
     * @property {number[]} ports
     * @property {number} workers - The number of workers that should be available.
     */

    /**
     * @typedef app
     * @property {string} dir
     * @property {number} [reviveCount]
     * @property {number} [workers]
     */

    /**
     * Add an app to the stats.
     * @param {app} app
     * @returns {appStats}
     */
    function addApp(app) {
      stats[app.name] = {
        dir: app.dir,
        pending: 0,
        available: 0,
        killed: 0,
        ports: 0,
        reviveCount: app.reviveCount || 0,
        workers: app.workers || 0
      }
    }

    // show every started app (even if no workers are running)
    config.apps.forEach(addApp)

    Worker.workerList.forEach(worker => {
      const { name } = worker

      // show stopped apps that have running workers
      if (!stats[name]) {
        addApp({
          dir: worker.dir
        })
      }

      const appStats = stats[name]

      // increase state counter
      const state = states[worker.state].toLowerCase()
      appStats[state]++

      // add ports
      appStats.ports = mergePorts(appStats.ports, worker.ports)
    })

    resolve({
      isResurrectable: global.isResurrectable,
      stats
    })
  })
}
