function mergePorts(...portArrays) {
	const known = []
	return [].concat(...portArrays).filter(port => {
		if (!known.includes(port)) {
			known.push(port)
			return true
		}
	})
}

module.exports = mergePorts
