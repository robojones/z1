module.exports = function exit() {

  setTimeout(() => {
    process.exit(0)
  }, 500)

  return Promise.resolve({})
}
