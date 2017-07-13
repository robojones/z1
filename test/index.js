const path = require('path')

const testResolve = file => {
  return path.join(__dirname, file)
}

const localResolve = file => {
  return path.join(__dirname, '..', file)
}

global.test = file => {
  return require(testResolve(file))
}

global.local = file => {
  return require(localResolve(file))
}

global.test.resolve = testResolve
global.local.resolve = localResolve

test('daemon/index')
test('cli/index')
test('remote/index')
test('remote/z1')
