const dev = process.env.NODE_ENV === 'development'
const DEFAULT_VALUE = dev ? 0 : 30000 // 0 or 30s

/**
 * If timeout === Infinity it returns "Infinity". If timeout === undefined it returns the default timeout. If the timeout is a Number it returns the timeout.
 * @param {string|number} timeout
 * @returns {string|number}
 */
function parseTimeout(timeout = DEFAULT_VALUE) {
	if (isNaN(timeout)) {
		throw new TypeError('Timeout must be a number, undefined or Infinity.')
	}

	if (!isFinite(timeout)) {
		return 'Infinity'
	}

	return +timeout
}

module.exports = parseTimeout
