
function log(...msg) {
  if (process.env.DEBUG) {
    console.log(...msg)
  }
}

function handle(err) {
  if (process.env.DEBUG) {
    console.error(err)
  } else {
    console.error(`\n  error: ${err.message}\n`)
  }
  process.exit(1)
}

module.exports = {
  log,
  handle
}
