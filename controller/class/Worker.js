const cluster = require('cluster')
const BetterEvents = require('better-events')
const path = require('path')


const workers = {}
const workerList = []

class Worker extends BetterEvents {
  constructor(dir, file, name, ports, env) {
    super()

    this.dir = dir
    this.file = file
    this.name = name
    this.ports = ports.slice()
    this.state = 0

    // change cwd
    const owd = process.cwd()
    process.chdir(dir)

    cluster.setupMaster({
      exec: path.join(dir, file)
    })

    // fork new worker
    const w = cluster.fork(env)
    this.id = w.id

    // restore cwd
    process.chdir(owd)

    // add to workers
    workers[this.id] = this
    workerList.push(this)

    w.once('exit', (code, signal) => {
      // remove from workers
      delete workers[this.id]
      //it can not happen that the worker is not in the workerList
      workerList.splice(workerList.indexOf(this), 1)

      this.emit('exit', code, signal)
    })

    const listening = (address) => {
      const i = this.ports.indexOf(address.port)
      if(i !== -1) {
        this.ports.splice(i, 1)
      }

      if(!this.ports.length) {
        this.removeListener('listening', listening)

        this.emit('available')
      }
    }

    // states
    this.once('available', () => {
      if(this.state < Worker.AVAILABLE) {
        this.state = Worker.AVAILABLE
      }
    })

    w.on('listening', listening)
  }

  kill(time) {
    this.state = Worker.KILLED

    const w = this.w

    if(!w) {
      return false
    }

    w.disconnect()

    if(typeof time === 'number') {
      const timeout = setTimeout(() => {
        w.kill()
      }, time)
      w.once('disconnect', () => {
        clearTimeout(timeout)
      })
    }

    return true
  }

  get w() {
    return cluster.workers[this.id]
  }

  static get workers() {
    return workers
  }

  static get workerList() {
    return workerList
  }

  static get PENDING() {
    return 0
  }

  static get AVAILABLE() {
    return 1
  }

  static get KILLED() {
    return 2
  }
}

module.exports = Worker
