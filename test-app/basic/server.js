const http = require('http')

const server = http.createServer((req, res) => {
  res.end('it worked')
})

console.log('test :D')

server.listen(+process.env.PORT)

