const util = require('util')

/**
 * Format items of all kind into a string like console.log() does.
 * @param {*} stuff
 * @returns {string}
 */
function logify(...stuff) {
	return stuff.map(item => {
		if (typeof item === 'object' || typeof item === 'undefined') {
			return util.inspect(item)
		} else {
			return item
		}
	}).join(' ')
}

module.exports = logify
