const { spawn } = require('child_process')
const { StringDecoder } = require('string_decoder')

const defaultConfig = {
  stdio: 'pipe',
  shell: true
}

function run(command, args = [], config = {}) {
  return new Promise((resolve, reject) => {
    const c = Object.assign({}, defaultConfig, config)
    const child = spawn(command, args, c)

    child.on('error', reject)

    // save error messages

    let errMessage = ''
    const errDecoder = new StringDecoder('utf8')

    child.stderr.on('data', chunk => {
      errMessage += errDecoder.write(chunk)
    })

    child.stderr.on('close', () => {
      errMessage += errDecoder.end()
    })

    // save logs

    let logs = ''
    const logDecoder = new StringDecoder('utf8')

    child.stdout.on('data', chunk => {
      logs += logDecoder.write(chunk)
    })

    child.stdout.on('close', () => {
      logs += logDecoder.end()
    })

    // wait for process to exit

    child.on('exit', (code) => {
      if (code) {
        reject(new Error(errMessage))
        return
      }

      resolve(logs)
    })
  })
}

module.exports = run
