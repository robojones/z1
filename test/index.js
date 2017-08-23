const fs = require('mz/fs')
const path = require('path')

before(async function () {
  console.log('remove config.json.')
  try {
    await fs.unlink(path.resolve(process.env.HOME, '.z1/config.json'))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
})
