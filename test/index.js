const z1 = require('..')
const { once } = require('better-events')
const { spawn } = require('child_process')
let daemon

before(async function () {
  // wait for the test-daemon to start

  this.timeout(10000)
  daemon = spawn('istanbul', ['cover', './daemon/main.js', '--dir', './coverage/daemon'], {
    stdio: 'inherit'
  })

  const connection = z1._waitForConnection()
  const error = once(daemon, 'error')

  await Promise.race([connection, error])
})

after(async function () {
  // wait for daemon to stop

  this.timeout(10000)

  z1.exit()

  await once(daemon, 'exit')
})
