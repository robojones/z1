const path = require('path')
const cpuCount = require('os').cpus().length
const cluster = require('cluster')
const mkdirp = require('mkdirp-promise')

const Worker = require('../lib/class/Worker')
const logManager = require('./log')
const sendLogsToCLI = require('./send-logs-to-CLI')
const killWorkers = require('./kill-workers')

const NOEND = {
  end: false
}

module.exports = async function startWorkers(config, dir, pack, args = [], env = {}, connection) {
  const workers = []

  if (pack.name === 'z1') {
    throw new Error('the name "z1" is invalid')
  }

  const ports = pack.ports
  const streams = logManager.get(pack.name)

  // output path
  let output = null
  if (typeof pack.output === 'string') {
    if (path.isAbsolute(pack.output)) {
      output = pack.output
    } else {
      output = path.join(dir, pack.output)
    }
  } else {
    output = path.join(process.env.HOME, '.z1', pack.name)
  }

  const workerCount = Math.abs(+pack.workers) || cpuCount

  const exitPromises = []
  const availablePromises = []

  // setup logs
  await mkdirp(output)

  logManager.setup(pack.name, output)

  const logs = sendLogsToCLI(pack.name, connection)

  // setup master
  cluster.setupMaster({
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    args
  })

  const ENV = Object.assign({}, env, {
    PWD: dir,
    APPNAME: pack.name,
    PORT: ports[0],
    PORTS: ports.join()
  })

  for (let i = 0; i < workerCount; i += 1) {
    const worker = new Worker(dir, pack.main, pack.name, ports, ENV)
    const w = worker.w
    w.process.stdout.pipe(streams.log, NOEND)
    w.process.stderr.pipe(streams.err, NOEND)
    w.on('error', handle)

    workers.push(worker)

    exitPromises.push(worker.once('exit').then(code => {
      throw new Error(`worker of app "${pack.name}" not started (exit code: ${code})`)
    }))
    availablePromises.push(worker.once('available'))

    worker.once('available').then(async () => {
      // wait to resurrect the worker
      const code = await worker.once('exit')
      if (code) {
        log(`worker ${worker.id} of "${worker.name}" crashed. (code: ${code})`)
      }

      if (worker.state !== Worker.KILLED) {
        // revive worker
        log(`starting 1 new worker for "${worker.name}"`)

        const app = config.apps.find(app => app.name === worker.name)

        log('found app', app.name)

        if (!app) {
          return
        }

        if (!app.reviveCount) {
          app.reviveCount = 0
        }

        app.reviveCount += 1

        const pkg = Object.assign({}, pack, {
          workers: 1
        })

        await startWorkers(config, dir, pkg, args, env)
      }
    }).catch(handle)
  }

  const availablePromise = Promise.all(availablePromises)
  const exitPromise = Promise.race(exitPromises)

  try {
    // Wait for all workers to start.
    await Promise.race([exitPromise, availablePromise])

    logs.stop()

    return {
      app: pack.name,
      dir,
      started: workerCount,
      ports
    }
  } catch (err) {
    // must be called before killWorkers to prevent duplication
    logs.stop()

    await killWorkers(workers, 0, 'SIGTERM', connection)
    logManager.remove(pack.name)

    throw err
  }
}
