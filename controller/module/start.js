const fs = require('fs')
const cpuCount = require('os').cpus().length

const Worker = require('./../class/Worker')


module.exports = function fork(dir, pack) {
  return new Promise((resolve, reject) => {
    verify(pack)

    const workerCount = Math.abs(pack.workers) || cpuCount

    const e = []
    const q = []

    const oldWd = process.cwd()
    process.chdir(dir)

    const env = {
      PWD: dir
    }

    for(let i = 0; i < workerCount; i++) {
      let worker = new Worker(dir, pack.main, pack.name, pack.ports, env)

      e.push(worker.once('error'))
      q.push(worker.once('available'))
    }

    process.chdir(oldWd)

    Promise.race(e).then(reject)

    Promise.all(q).then(() => {
      resolve({
        app: pack.name,
        dir: dir,
        started: workerCount
      })
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
    throw new Error('ports in package.json must be an Array')
  }

  if(!pack.ports.length) {
    throw new Error('ports in package.json must contain at least one port')
  }

  const valid = pack.ports.filter(p => typeof p === 'number')

  if(valid.length !== pack.ports.length) {
    throw new Error('ports in package.json must (only) contain numbers')
  }
}
