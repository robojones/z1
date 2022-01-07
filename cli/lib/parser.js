const path = require('path')

function ports(string) {
	return string.split(',').map(v => +v)
}

function resolve(string = '.') {
	return path.resolve(string)
}

module.exports = {
	ports,
	path: resolve,
}
