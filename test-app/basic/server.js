const http = require('http')

const server = http.createServer((req, res) => {
	res.end('it worked')
})

setInterval(() => {
	console.log('test :D')
}, 4000)

server.listen(+process.env.PORT)

console.log('test log written to stdout')
console.error('test log written to stderr')
