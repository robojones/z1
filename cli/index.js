#! /usr/bin/env node

const net = require('net')
const fs = require('fs')
const path = require('path')
const util = require('util')
const program = require('commander')
const xTime = require('x-time')

const z1 = require('./../remote/index')
const pack = require('./../package.json')

program
  .version(pack.version)
  .arguments('<cmd>')
  .action(function (cmd) {
    console.log(cmd)
  })
program
  .command('resurrect')
  .description('start the apps that were started before exit')
  .action(() => {
    return z1.resurrect().then(data => {
      console.log('resurrected')
      console.log('apps:', data.apps)
      console.log('workers started:', data.started)
    }).catch(handle)
  })
program
  .command('start [dir]')
  .description('start the app in the dir')
  .action((dir) => {
    return z1.start(dir).then(data => {
      console.log('started')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
    }).catch(handle)
  })
program
  .command('stop <appName> [timeout]')
  .description('stop the app specified by the appName')
  .action((appName, timeout) => {
    return z1.stop(appName, timeout).then(data => {
      console.log('stopped')
      console.log('name:', data.app)
      console.log('workers killed:', data.killed)
    }).catch(err => handle)
  })
program
  .command('restart <appName> [timeout]')
  .description('restart the app specified by the appName')
  .action((appName, timeout) => {
    return z1.restart(appName, timeout).then(data => {
      console.log('restarted')
      console.log('name:', data.app)
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })
program
  .command('list')
  .description('overview of all running workers')
  .action(() => {
    return z1.list().then(data => {
      const props = Object.keys(data)

      if(!props.length) {
        console.log('no workers running')
        return
      }

      const max = process.stdout.columns
      const stuff = '                    '

      console.log(' workers name                 directory')
      for(const prop of props) {
        let obj = data[prop]
        let p = (stuff + obj.pending).substr(-2)
        let a = (stuff + obj.available).substr(-2)
        let k = (stuff + obj.killed).substr(-2)
        let name = (prop + stuff).substr(0, 20)
        let dir = obj.dir.substr(0, max - 30)
        console.log(p, a, k, name, dir)
      }
      console.log(' |  |  |')
      console.log(' |  | killed')
      console.log(' | available')
      console.log('pending')
    }).catch(handle)
  })
program
  .command('exit')
  .description('kill the z1 daemon')
  .action(() => {
    return z1.exit().then(data => {
      console.log('daemon stopped')
    }).catch(handle)
  })

if(process.argv.length === 2) {
  console.log('no command given')
  process.exit(1)
}

program.parse(process.argv)

function handle(err) {
  console.error('[ERROR] - ' + err.message)
  process.exit(1)
}
