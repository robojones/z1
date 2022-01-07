class AppStats {
	constructor(dir) {
		this.dir = dir
		this.pending = 0
		this.available = 0
		this.killed = 0
		this.ports = []
	}
}

module.exports = AppStats
