const http = require('http')

console.log('pwd', process.env.PWD)
console.log('cwd', process.cwd())
console.log('argv', process.argv)

// process.exit(10)

process.on('message', msg => {
  if(msg === 'exit') {
    process.exit(0)
  } else if(msg === 'crash') {
    process.exit(1)
  }
})

console.log('started at', (new Date()).toUTCString())

const server = http.createServer((req, res) => {
  res.end('it worked')
})

server.listen(8080)

const server2 = http.createServer((req, res) => {
  res.write('this ist the second server')
  // res.end() not called
})

server2.listen(8081)
