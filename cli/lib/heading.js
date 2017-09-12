const colors = require('colors/safe')

/**
 * Logs a horizontal line with the width of the terminal.
 */
function heading(msg = '') {
  console.log(colors.inverse(msg + ' '.repeat(process.stdout.columns - msg.length)))
}

module.exports = heading
