const BetterEvents = require('better-events')
const path = require('path')
const fs = require('fs')

const stream = require('stream')
const formatDate = require('./../snippet/formatDate')

const APPEND = {
  flags: 'a'
}
const NOEND = {
  end: false
}

/**
 * @typedef streams
 * @property {stream.PassThrough} log
 * @property {stream.PassThrough} err
 * @property {stream.Writable} logStream
 * @property {stream.Writable} errStream
 * @property {*} timeout
 */

/**
 * Class representing a log manager.
 */
class LogManager extends BetterEvents {
  /**
   * Create a new LogManager instance.
   */
  constructor() {
    super()

    this.streams = {}
  }

  /**
   * Get the streams for an app.
   * @property {string} - The id of the app.
   * @returns {streams} 
   */
  get(id) {
    if (!this.streams[id]) {
      this.streams[id] = {
        log: new stream.PassThrough(),
        err: new stream.PassThrough(),
        logStream: null,
        errStream: null,
        timeout: null
      }
    }

    return this.streams[id]
  }

  /**
   * Sets up the streams for the logs.
   * @param {string} id - The id of the app. 
   * @param {string} dir - The directory for the logs.
   * @param {Date} date - The current date.
   */
  setup(id, dir = '') {
    const streams = this.get(id)

    // End old streams and cancel old log rotation.
    clearTimeout(streams.timeout)

    if (streams.logStream) {
      streams.logStream.end()
      streams.errStream.end()
    }

    const dateString = formatDate(new Date())

    // Paths to the files.
    const logFile = path.resolve(dir, dateString + '-log.txt')
    const errFile = path.resolve(dir, dateString + '-error.txt')

    // WriteStreams for the files.
    streams.logStream = fs.createWriteStream(logFile, APPEND)
    streams.errStream = fs.createWriteStream(errFile, APPEND)

    // TODO: Handle errors (try to reopen the streams)

    // Pipe the PassThrough streams into the WriteStreams.
    streams.log.pipe(streams.logStream, NOEND)
    streams.err.pipe(streams.errStream, NOEND)

    const nextDay = new Date()
    nextDay.setUTCDate(nextDay.getDate() + 1)
    nextDay.setUTCHours(0)
    nextDay.setUTCMinutes(0)
    nextDay.setUTCSeconds(0)
    nextDay.setUTCMilliseconds(0)

    streams.timeout = setTimeout(() => {
      this.setup(id, dir)
    }, nextDay - Date.now())

    return streams
  }

  /**
   * Removes the streams for a app. Returns true if the id was found and removed.
   * @param {string} id - The id of the app.
   * @returns {boolean}
   */
  remove(id) {
    if (this.streams[id]) {
      const stuff = this.get(id)

      stuff.logStream.end()
      stuff.errStream.end()

      stuff.log.end()
      stuff.err.end()

      clearTimeout(stuff.timeout)

      delete this.streams[id]

      return true
    }

    return false
  }
}

module.exports = LogManager
