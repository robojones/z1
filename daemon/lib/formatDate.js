const leftpad = require('leftpad')

/**
 * Creates a date string of the format "YYYY-MM-DD".
 * @param {Date} date - The date to stringify.
 * @returns {string}
 */
function format(date) {
  const year = date.getUTCFullYear()
  const month = leftpad(date.getUTCMonth(), 2)
  const day = leftpad(date.getUTCDate(), 2)

  return `${year}-${month}-${day}`
}

module.exports = format
