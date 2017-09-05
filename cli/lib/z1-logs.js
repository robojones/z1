function z1Logs(z1) {
  z1.on('log', msg => {
    console.log(msg)
  })

  z1.on('stdout', chunk => {
    process.stdout.write(chunk)
  })

  z1.on('stderr', chunk => {
    process.stderr.write(chunk)
  })
}

module.exports = z1Logs
