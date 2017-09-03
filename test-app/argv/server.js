const http = require('http')

const server = http.createServer((req, res) => {
  res.end('it worked')
})

server.listen(+process.argv[2])

