module.exports = server => {
  function exit() {
    server.close(() => {
      process.exit()
    })

    return Promise.resolve({})
  }

  return exit
}
