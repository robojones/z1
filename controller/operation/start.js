const path = require('path')
const fs = require('fs')
const cluster = require('cluster')

const Worker = require('./../class/Worker')
const testPackage = require('./../snippet/testPackage')
const Tube = require('./../class/Tube')
const formatDate = require('./../snippet/formatDate')

const cpuCount = require('os').cpus().length
const dir = require('./../module/init').dir

const hour = 1000 * 60 * 60

const stdio = {}

const noEnd = {
  end: false
}

/*
command: start {
  dir // absolute path to dir
}
*/

module.exports = function start(config, command, dontThrow) {

    return new Promise((resolve, reject) => {


      resolve({
        app: pack.name,
        dir: command.dir,
        started: k
      })
    })

    function checkName(name) {
      const r = Worker.workerList.filter(w => w.name === name)
      if(r.length) {
        throw new Error(`name already used for another app (${r[0].dir})`)
      }
    }

    function connect(stdio) {
      if(stdio.currentOut || stdio.currentErr) {
        stdio.stdout.unpipe(stdio.currentOut)
        stdio.stderr.unpipe(stdio.currentErr)
      }

      //create new streams
      const opts = {
        flags: 'a'
      }
      const date = formatDate()
      const outFile = path.join(stdio.output, `log-${date}.txt`)
      const errFile = path.join(stdio.output, `err-${date}.txt`)
      stdio.currentOut = fs.createWriteStream(outFile, opts)
      stdio.currentErr = fs.createWriteStream(errFile, opts)

      stdio.stdout.pipe(stdio.currentOut)
      stdio.stderr.pipe(stdio.currentErr)
    }
