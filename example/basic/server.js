const http = require('http')

const server = http.createServer((req, res) => {
  res.end('it worked')
})

server.listen(8080)

