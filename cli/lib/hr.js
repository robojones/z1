/**
 * Logs a horizontal line with the width of the terminal.
 */
function hr() {
  console.log('-'.repeat(process.stdout.columns))
}

module.exports = hr
