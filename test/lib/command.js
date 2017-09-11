const command = require('command-test')
const path = require('path')
const dirList = []
const cliFile = path.resolve('cli/main.js')

function getDir(cmd) {
  let dir = path.join('coverage', cmd.replace(/\W+/g, '-'))
  let no = 0

  while (dirList.includes(dir)) {
    const i = dir.indexOf('.')
    if (i !== -1) {
      dir = dir.substr(0, i)
    }

    no += 1
    dir += '.' + no
  }

  dirList.push(dir)
  return dir
}

function modify(cmd) {
  const dir = getDir(cmd)
  return cmd.replace(/z1/, `istanbul cover --dir ${dir} ${cliFile} --`)
}

/**
 * Executes a command. Throws if the exit code is not 0.
 * @param {string} cmd - The command.
 */
function works(cmd) {
  cmd = modify(cmd)
  return command.works(cmd)
}

/**
 * Executes a command. Throws an error if the exit code is 0.
 * @param {string} cmd - The command.
 */
function fails(cmd) {
  cmd = modify(cmd)
  return command.fails(cmd)
}

module.exports = {
  works,
  fails
}
