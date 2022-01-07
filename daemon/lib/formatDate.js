/**
 * Creates a date string of the format "YYYY-MM-DD".
 * @param {Date} date - The date to stringify.
 * @returns {string}
 */
function format(date) {
	const year = date.getUTCFullYear()
	const month = date.getUTCMonth().toString().padStart(2, '0')
	const day = date.getUTCDate().toString().padStart(2, '0')

	return `${year}-${month}-${day}`
}

module.exports = format
