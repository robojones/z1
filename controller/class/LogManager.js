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
      logFile: null,
      errFile: null,
      interval: null
    }
  }

  setup(id, dir) {

    const connect = () => {

      const d = formatDate()

      const logFile = path.join(dir, `log-${d}.txt`)
      const errFile = path.join(dir, `err-${d}.txt`)

      const log = fs.createWriteStream(logFile, APPEND)
      const err = fs.createWriteStream(errFile, APPEND)

      this.collect(log, 'error')
      this.collect(err, 'error')

      const tubes = this.get(id)

      tubes.log.pipe(log, NOEND)
      tubes.err.pipe(err, NOEND)

      if(tubes.logFile) {
        tubes.logFile.end()
        tubes.errFile.end()
      }
    }

    clearInterval(tubes.interval)

    connect()

    tubes.interval = setInterval(connect, DAY)

    return tubes
  }
}

module.exports = LogManager
