const BetterEvents = require('better-events')
const path = require('path')
const fs = require('fs')

const stream = require('stream')
const formatDate = require('../formatDate')

const APPEND = {
	flags: 'a',
}
const NOEND = {
	end: false,
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

		/** @type {{string: streams}} */
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
				timeout: null,
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

		/**
     * Open a WriteStream and pipe the source into it.
     * @param {string} name - Name for the WriteStream.
     * @param {string} file - The name of the file.
     * @param {stream.PassThrough} source - A stream to pipe into the WriteStream.
     */
		function openStream(name, file, source) {
			if (streams[name] && streams[name].writable) {
				streams[name].end()
			}

			const stream = fs.createWriteStream(file, APPEND)

			stream.on('error', error => {
				handle(error)
				openStream(name, file, source)
			})

			source.pipe(stream, NOEND)

			streams[name] = stream
		}

		// WriteStreams for the files.
		openStream('logStream', logFile, streams.log)
		openStream('errStream', errFile, streams.err)

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
