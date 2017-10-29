function log(...msg) {
  if (process.env.Z1_DEBUG === 'true') {
    console.log(...msg)
  }
}

function handle(err) {
  if (process.env.Z1_DEBUG === 'true') {
    console.error(err)
  } else {
    console.error(`\n  error: ${err.message}\n`)
  }
  process.exit(1)
}

global.log = log
global.handle = handle
