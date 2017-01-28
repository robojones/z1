module.exports = function exit() {

  setTimeout(() => {
    global.cleanup()
    process.exit(0)
  }, 100)

  return Promise.resolve({})
}
