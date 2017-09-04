function z1Logs(z1) {
  z1.on('log', (log) => {
    process.stdout.write(log)
  })
}

module.exports = z1Logs
