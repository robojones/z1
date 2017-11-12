const colors = require('colors/safe')
const heading = require('./heading')

/**
 * @typedef result
 * @property {string} name
 * @property {number} started
 * @property {number} killed
 */

/**
 * Logs the contents of a result object.
 * @param {result} result
 */
function logResult(result) {
  heading('workers ports     name')
  const name = result.app.padEnd(20)
  const started = ('+' + (result.started || 0)).padEnd(3)
  const killed = ('-' + (result.killed || 0)).padEnd(3)
  const ports = (result.ports ? result.ports.join() : '-').padEnd(9)

  console.log(`${colors.red.bold(killed)} ${colors.green.bold(started)} ${ports} ${name}`)
}

module.exports = logResult
