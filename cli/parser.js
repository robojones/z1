const util = require('util')
const path = require('path')

function ports(string) {
  return string.split(',').map(v => +v)
}

function env(string) {
  const e = {}

  string.split(',').forEach(pair => {
    const parts = pair.split('=')
    e[parts[0]] = parts[1]
  })

  return e
}

function resolve(string = '.') {
  return path.resolve(string)
}

module.exports = {
  ports,
  env: util.deprecate(env, '--env: use normal environment variables instead'),
  path: resolve
}
