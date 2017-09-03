const assert = require('assert')
const path = require('path')
const z1 = require('../..')

/**
 * @typedef appProps
 * @property {string} [dir]
 * @property {number[]} [ports]
 * @property {number} [pending]
 * @property {number} [available]
 * @property {number} [killed]
 * @property {number} [reviveCount]
 */

/**
 * Verify the statistics of an app.
 * @param {*} name - The name of the app.
 * @param {appProps} props - The properties of the app.
 */
async function verifyApp(name, props = {}) {
  props = Object.assign({
    dir: path.resolve('example', name),
    ports: [],
    pending: 0,
    available: 0,
    killed: 0,
    reviveCount: 0
  }, props)

  const stats = await z1.info(name)

  for (let i = 0; i < props.ports.length; i += 1) {
    assert.strictEqual(stats.ports[i], props.ports[i], `"${name}" should listen to port ${stats.ports[i]}.`)
  }

  assert.strictEqual(stats.pending, props.pending, `"${name}" should habe ${props.available} pending worker(s).`)
  assert.strictEqual(stats.available, props.available, `"${name}" should habe ${props.available} available worker(s).`)
  assert.strictEqual(stats.killed, props.killed, `"${name}" should habe ${props.available} killed worker(s).`)
  assert.strictEqual(stats.reviveCount, props.reviveCount, `"${name}" should be revived ${props.reviveCount} time(s).`)
}

module.exports = verifyApp
