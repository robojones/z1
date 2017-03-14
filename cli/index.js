#! /usr/bin/env node

const net = require('net')
const fs = require('fs')
const path = require('path')
const util = require('util')
const assert = require('assert')
const program = require('commander')
const xTime = require('x-time')
const spawn = require('child_process').spawn

const z1 = require('./../remote/index')
const pack = require('./../package.json')
const spam = require('./message')
const features = require('./features')

const SPACER = '--'


const argv = process.argv.slice()
let args = []
if(argv.includes(SPACER)) {
  args = argv.splice(argv.indexOf(SPACER))
  args.shift()
}

program
  .version(pack.version)
  .action(function (cmd) {
    handle(new Error(`command "${cmd}" not found`))
  })
program
  .command('resurrect')
  .description('start the apps that were started before exit')
  .action(() => {
    console.log('resurrecting')
    spam.start()
    return z1.resurrect().then(data => {
      spam.stop()
      console.log('resurrected')
      console.log('workers started:', data.started)
    }).catch(handle)
  })
program
  .command('start [dir]')
  .usage('[options] [dir] [-- [arguments]]')
  .description('start the app in the dir')
  .option('-n, --name <name>', 'name of your app')
  .option('-p, --ports <ports>', 'ports that your app listens to')
  .option('-w, --workers <workers>', 'count of workers (default: number of CPUs)')
  .option('-o, --output <output>', 'directory for the log files of this app')
  .option('-e, --env <env>', 'environment variables e.g. NODE_ENV=development')
  .action((dir, opts) => {

    // prepare opts
    const opt = {
      name: opts.name,
      workers: opts.workers
    }
    if(opts.ports) {
      opt.ports = opts.ports.split(',').map(v => +v)
    }
    if(opts.output) {
      opt.output = path.resolve(opts.output)
    }

    // parse environment variables
    const env = {}
    if(opts.env) {
      opts.env.split(',').forEach(pair => {
        const parts = pair.split('=')
        env[parts[0]] = parts[1]
      })
    }

    console.log('starting app')
    spam.start()
    return z1.start(dir, args, opt, env).then(data => {
      spam.stop()
      console.log('started')
      console.log('name:', data.app)
      console.log('ports:', data.ports.join())
      console.log('workers started:', data.started)
    }).catch(handle)
  })
program
  .command('stop [appName]')
  .description('stop the app specified by the appName')
  .option('-t, --timeout <timeout>', 'time until the workers get killed')
  .option('-s, --signal <signal>', 'kill signal')
  .action((appName = getAppName(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    console.log(`stopping app "${appName}"`)
    spam.start()
    return z1.stop(appName, opt).then(data => {
      spam.stop()
      console.log('stopped')
      console.log('name:', data.app)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })
program
  .command('restart [appName]')
  .description('restart the app specified by the appName')
  .option('-t, --timeout <timeout>', 'time until the old workers get killed')
  .option('-s, --signal <signal>', 'kill signal for the old workers')
  .action((appName = getAppName(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    console.log(`restarting app "${appName}"`)
    spam.start()
    return z1.restart(appName, opt).then(data => {
      spam.stop()
      console.log('restarted')
      console.log('name:', data.app)
      console.log('ports:', data.ports.join())
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })
program
  .command('list')
  .description('overview of all running workers')
  .option('-m, --minimal', 'minimalistic list (easy to parse)')
  .action(opt => {
    return z1.list().then(data => {
      const props = Object.keys(data.stats)

      if(!props.length) {
        console.log('no workers running')
        return
      }

      if(opt.minimal) {
        console.log(props.join(' '))
        return
      }

      const max = process.stdout.columns
      const stuff = '                    '

      console.log(' workers name                 directory')
      for(const prop of props) {
        let obj = data.stats[prop]
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

      if(data.isResurrectable) {
        console.log('\nThe listed apps are currently not running.\nType "z1 resurrect" to start them.')
      }
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
program
  .command('install [feature]')
  .description('install additional features')
  .option('-m, --minimal', 'minimalistic list (easy to parse)')
  .action((feature, opts) => {
    // features:
    // zsh (completion)
    // bash (completion)
    // cron (resurrect)

    const folder = path.join(__dirname, '..', 'install')

    if(opts.minimal) {
      Object.keys(features).forEach((feature, i, list) => {
        process.stdout.write(feature)
        if(list[i+1]) {
          process.stdout.write(' ')
        }
      })
      process.stdout.write('\n')

    } else if(!feature) {
      console.log('\nFeatures:\n')
      Object.keys(features).forEach(feature => {
        console.log(`${feature} - ${features[feature]}`)
      })
      console.log()
    } else if (features.hasOwnProperty(feature)) {
      const file = path.join(folder, feature)
      const installer = spawn(file, [], {
        cwd: folder,
        stdio: 'inherit',
        shell: true
      })
      installer.on('error', handle)
      installer.on('exit', (code) => {
        process.exit(code)
      })
    } else {
      handle(new Error('feature not found'))
    }
  })

  program
    .command('uninstall <feature>')
    .description('uninstall features')
    .action((feature, opts) => {

      const folder = path.join(__dirname, '..', 'uninstall')

      if (features.hasOwnProperty(feature)) {
        const file = path.join(folder, feature)
        const uninstaller = spawn(file, [], {
          cwd: folder,
          stdio: 'inherit',
          shell: true
        })
        uninstaller.on('error', handle)
        uninstaller.on('exit', (code) => {
          process.exit(code)
        })
      } else {
        handle(new Error('feature not found'))
      }
    })

if(process.argv.length === 2) {
  handle(new Error('no command given'))
}

program.parse(argv)

function getAppName() {
  console.log('no appName given')
  console.log('searching directory for package.json')
  try {
    const file = path.join(process.cwd(), 'package.json')
    const pack = require(file)
    assert(pack.name)
    console.log(`found name "${pack.name}" in package.json`)
    return pack.name
  } catch(err) {
    console.error(`no package.json file found`)
    handle(new Error('missing argument `appName\''))
  }
}

function handle(err) {
  if(process.env.NODE_ENV === 'development') {
    console.error(err)
  } else {
    console.error(`\n  error: ${err.message}\n`)
  }
  process.exit(1)
}
