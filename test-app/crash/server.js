const z1 = require('../../remote')

z1.ready().then(async () => {
	const stats = await z1.info(process.env.APPNAME)

	if (stats.reviveCount < 2) {
		setTimeout(() => {
			process.exit(1)
		}, 100)
	}
}).catch(console.error)
