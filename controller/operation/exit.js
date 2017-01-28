module.exports = function exit() {

  setTimeout(() => {
    global.cleanup()
    process.exit(0)
  }, 500)

  return Promise.resolve({})
}
