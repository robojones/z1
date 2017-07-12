const fill = require('./fill')

function format(time = Date.now(), space) {
  // time in ms
  const date = new Date(time)

  const y = date.getUTCFullYear()
  const m = date.getUTCMonth() + 1
  const d = date.getUTCDate()

  return [y, fill(m, '0', 2), fill(d, '0', 2)].join(space || '-')
}

module.exports = format
