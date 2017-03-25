const fs = require('fs')
const path = require('path')
const cpuCount = require('os').cpus().length
const cluster = require('cluster')
const mkdirp = require('mkdirp')

const Worker = require('./../class/Worker')
const logs = require('./log')

const NOEND = {
  end: false
}


module.exports = function startWorkers(dir, pack, args = [], env = {}) {
  return new Promise((resolve, reject) => {
    verify(pack)

    if(pack.name === 'z1') {
      throw new Error('the name "z1" is invalid')
    }

    const ports = pack.ports
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

    const ENV = Object.assign({}, env, {
      PWD: dir,
      APPNAME: pack.name,
      PORT: ports[0]
    })

    for(let i = 0; i < workerCount; i++) {
      let worker = new Worker(dir, pack.main, pack.name, ports, ENV)
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
            startWorkers(dir, pkg, args, env).catch(handle)
          }
        })
      }))
    }

    // when all workers are online before an error
    e.push(Promise.all(q))
    n.push(Promise.race(e))

    Promise.all(n).then(() => {
      resolve({
        app: pack.name,
        dir: dir,
        started: workerCount,
        ports: ports
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

  verifyPorts('devPorts', false)
  verifyPorts('ports', true)

  function verifyPorts(prop, required) {

    if(Array.isArray(pack[prop])) {

      const valid = pack[prop].filter(p => typeof p === 'number')

      if(valid.length !== pack[prop].length) {
        if(required) {
          throw new Error(prop, 'in package.json must (only) contain numbers')
        } else {
          delete pack[prop]
        }
      }

    } else if(pack[prop] || required) {

      throw new Error(prop + ' in package.json must be an array')
    } else {

      delete pack[prop]
    }
  }
}
