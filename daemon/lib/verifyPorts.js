const mergePorts = require('./mergePorts')

function verifyPorts(pack, prop, origin = 'package.json') {
	const ports = pack[prop]

	if (Array.isArray(ports)) {
		if (ports.length) {
			// remove non-numeral ports
			const numeralPorts = pack[prop].filter(p => typeof p === 'number')

			// remove duplicates
			const valid = mergePorts(numeralPorts)

			if (valid.length !== pack[prop].length) {
				throw new Error(`invalid ${prop} in ${origin}`)
			}

			// everything ok
			return
		}
	} else if (ports) {
		// wrong type
		throw new TypeError(prop + ' in package.json must be an array or undefined')
	}

	// undefined or empty array
	pack[prop] = null
}

module.exports = verifyPorts
