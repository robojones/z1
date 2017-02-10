const BetterEvents = require('better-events')
const fs = require('fs')
const path = require('path')

const Tube = require('./Tube')
const formatDate = require('./../snippet/formatDate')

const streams = {}

const DAY = 1000 * 60 * 60 * 24
const APPEND = {
  flags: 'a'
}
const NOEND = {
  end: false
}

class LogManager extends BetterEvents {

  get(id) {
    if(streams[id]) {
      return streams[id]
    }

    const s = streams[id] = {
      log: new Tube(),
      err: new Tube(),
      logStream: null,
      errStream: null,
      interval: null
    }

    this.collect('error', s.log)
    this.collect('error', s.err)

    return s
  }

  setup(id, dir) {

    const stuff = this.get(id)

    console.log('setup logs for')
    console.log('id:', id)
    console.log('dir:', dir)
    console.log('cwd:', process.cwd())

    const connect = () => {

      const d = formatDate()

      const logFile = path.resolve(path.join(dir || '', d + '-log.txt'))
      const errFile = path.resolve(path.join(dir || '', d + '-error.txt'))

      const log = fs.createWriteStream(logFile, APPEND)
      const err = fs.createWriteStream(errFile, APPEND)

      log.on('end', () => console.log('log', id, 'closed'))
      log.write('example')

      this.collect('error', log)
      this.collect('error', err)

      stuff.log.pipe(log, NOEND)
      stuff.err.pipe(err, NOEND)

      if(stuff.logStream) {
        stuff.logStream.end()
        stuff.errStream.end()
      }

      stuff.logStream = log
      stuff.errStream = err
    }

    clearInterval(stuff.interval)

    connect()

    stuff.interval = setInterval(connect, DAY)

    return stuff
  }

  remove(id) {
    if(streams[id]) {
      const stuff = this.get(id)

      stuff.logStream.end()
      stuff.errStream.end()

      stuff.log.end()
      stuff.err.end()

      clearInterval(stuff.interval)

      delete streams[id]

      return true
    }

    return false
  }
}

module.exports = LogManager
