const z1 = require('..')
const fs = require('fs')
const { once } = require('better-events')
const { spawn } = require('child_process')
let daemon

const TIMEOUT = 30000 // 30s

before(async function () {
  // wait for the test-daemon to start

  this.timeout(TIMEOUT)
  daemon = spawn('istanbul', ['cover', './daemon/main.js', '--dir', './coverage/daemon'], {
    stdio: 'inherit'
  })

  const connection = z1._waitForConnection()
  const error = once(daemon, 'error')

  await Promise.race([connection, error])
})

after(async function () {
  // wait for daemon to stop

  this.timeout(TIMEOUT)

  await Promise.all([z1.exit(), once(daemon, 'exit')])
})

describe('z1', function () {
  describe('command', function () {
    this.timeout(TIMEOUT)

    beforeEach(function () {
      this.apps = []
    })

    afterEach(async function () {
      for (let i = 0; i < this.apps.length; i += 1) {
        await z1.stop(this.apps[i], {
          timeout: 10000
        })
      }
    })

    const files = fs.readdirSync('test/command')

    files.forEach(file => {
      require(`./command/${file}`)
    })
  })
})
