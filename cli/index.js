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
  .description('start the app in the dir')
  .action((dir) => {
    z1.start(dir).then(data => {
      console.log('started')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
    }).catch(handle)
  })
program
  .command('stop <appName> [timeout]')
  .description('stop the app specified by the appName')
  .action((appName, timeout) => {
    z1.stop(appName, timeout).then(data => {
      console.log('stopped')
      console.log('name:', data.app)
      console.log('workers killed:', data.killed)
    }).catch(err => handle)
  })
program
  .command('restart <appName> [timeout]')
  .description('restart the app specified by the appName')
  .action((appName, timeout) => {
    z1.restart(appName, timeout).then(data => {
      console.log('restarted')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })
program
  .command('exit')
  .description('kill the z1 daemon')
  .action((dir) => {
    z1.exit(dir).then(data => {
      console.log('master stopped')
    }).catch(handle)
  })
program
  .command('resurrect')
  .description('start the z1 daemon and started apps')
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
    }).catch(handle)
  })

program.parse(process.argv)

function handle(err) {
  console.error(err)
  process.exit(1)
}
