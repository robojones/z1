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

    return streams[id] = {
      log: new Tube(),
      err: new Tube(),
      logStream: null,
      errStream: null,
      interval: null
    }
  }

  setup(id, dir) {

    const tubes = this.get(id)

    const connect = () => {

      const d = formatDate()

      const logFile = path.resolve(path.join(dir || '', `log-${d}.txt`))
      const errFile = path.resolve(path.join(dir || '', `err-${d}.txt`))

      const log = fs.createWriteStream(logFile, APPEND)
      const err = fs.createWriteStream(errFile, APPEND)

      this.collect('error', log)
      this.collect('error', err)

      tubes.log.pipe(log, NOEND)
      tubes.err.pipe(err, NOEND)

      if(tubes.logStream) {
        tubes.logStream.end()
        tubes.errStream.end()
      }

      tubes.logStream = log
      tubes.errStream = err
    }

    clearInterval(tubes.interval)

    connect()

    tubes.interval = setInterval(connect, DAY)

    return tubes
  }
}

module.exports = LogManager
