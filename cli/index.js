#! /usr/bin/env node

const net = require('net')
const fs = require('fs')
const path = require('path')
const cp = require('child_process')
const program = require('commander')

const z1 = require('./../remote/index')
const pack = require('./../package.json')

program
  .version(pack.version)
program
  .command('start [dir]')
  .action((dir) => {
    z1.start(dir).then(data => {
      console.log('started')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
    }).catch(err => {
      console.error(err.message)
    })
  })
program
  .command('stop <appName> [timeout]')
  .action((appName, timeout) => {
    z1.stop(appName, timeout).then(data => {
      console.log('stopped')
      console.log('name:', data.app)
      console.log('workers killed:', data.killed)
    }).catch(err => {
      console.error(err.message)
    })
  })
program
  .command('restart <appName> [timeout]')
  .action((appName, timeout) => {
    z1.restart(appName, timeout).then(data => {
      console.log('restarted')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(err => {
      console.error(err.message)
    })
  })
program
  .command('exit')
  .action((dir) => {
    z1.exit(dir).then(data => {
      console.log('master stopped')
    }).catch(err => {
      console.error(err)
    })
  })
program
  .command('resurrect')
  .action(() => {
    z1.ping().then(() => {
      console.log('z1 already running')
    }).catch(err => {

      try {
        fs.unlinkSync(z1.socketFile)
      } catch(err) {
        if(err.code !== 'ENOENT') {
          throw err
        }
      }

      const z1Path = path.dirname(require.resolve('z1'))
      const file = path.join(z1Path, 'controller/index.js')
      const node = process.argv[0]

      const p = cp.spawn(node, [file], {
        stdio: 'ignore',
        detached: true
      })
      p.on('error', err => console.log(err))
      p.unref()

      console.log('master started')
    }).catch(err => {
      console.error(err.message)
    })
  })

program.parse(process.argv)
