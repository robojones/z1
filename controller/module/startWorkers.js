const fs = require('fs')
const path = require('path')
const cpuCount = require('os').cpus().length
const cluster = require('cluster')
const mkdirp = require('mkdirp')

const Worker = require('./../class/Worker')
const logs = require('./log')
global.log('hallo')

const NOEND = {
  end: false
}


module.exports = function startWorkers(dir, pack, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    verify(pack)

    if(pack.name === 'z1') {
      throw new Error('the name "z1" is invalid')
    }

    const out = logs.get(pack.name)

    // output path
    let output = null
    if(typeof pack.output === 'string') {
      if(path.isAbsolute(pack.output)) {
        output = pack.output
      } else {
        output = path.join(dir, pack.output)
      }
    } else {
      output = path.join(process.env.HOME, '.z1', pack.name)
    }

    const workerCount = Math.abs(+pack.workers) || cpuCount

    const e = []
    const q = []
    const n = []

    // create output dir
    n.push(new Promise((resolve, reject) => {
      mkdirp(output, err => {
        if(err && err.code !== 'EEXIST') {
          reject(err)
          return
        }

        logs.setup(pack.name, output)

        resolve()
      })
    }))

    // setup master
    cluster.setupMaster({
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      args: args
    })

    const oldWd = process.cwd()
    process.chdir(dir)

    const ENV = Object.assign({
      PWD: dir,
      APPNAME: pack.name,
      PORT: pack.ports[0]
    }, env)

    for(let i = 0; i < workerCount; i++) {
      let worker = new Worker(dir, pack.main, pack.name, pack.ports, ENV)
      let w = worker.w
      w.process.stdout.pipe(out.log, NOEND)
      w.process.stderr.pipe(out.err, NOEND)

      w.on('error', handle)

      e.push(worker.once('exit').then(code => {
        throw new Error(`worker of app "${pack.name}" not started (exit code: ${code})`)
      }))
      q.push(worker.once('available').then(() => {

        // try to worker if exit with code !== 0
        worker.once('exit', code => {
          if(code) {
            log(`worker ${worker.id} of "${worker.name}" crashed. (code: ${code})`)
            log(`starting 1 new worker for "${worker.name}"`)

            const pkg = Object.assign({}, pack, {
              workers: 1
            })
            function start (cb) {
              startWorkers(dir, pkg, args, env).catch(handle)
            }
          }
        })
      }))
    }

    process.chdir(oldWd)

    // when all workers are online before an error
    e.push(Promise.all(q))
    n.push(Promise.race(e))

    Promise.all(n).then(() => {
      resolve({
        app: pack.name,
        dir: dir,
        started: workerCount,
        ports: pack.ports
      })
    }).catch(err => {
      reject(err)
    })
  })
}

function verify(pack) {

  // name
  if(!pack.name) {
    throw new Error('name in package.json must be set')
  }

  // ports
  if(!Array.isArray(pack.ports)) {
    throw new Error('ports in package.json must be an array')
  }

  if(!pack.ports.length) {
    throw new Error('ports in package.json must contain at least one port')
  }

  const valid = pack.ports.filter(p => typeof p === 'number')

  if(valid.length !== pack.ports.length) {
    throw new Error('ports in package.json must (only) contain numbers')
  }
}
