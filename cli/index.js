#! /usr/bin/env node

const net = require('net')
const fs = require('fs')
const path = require('path')
const util = require('util')
const assert = require('assert')
const program = require('commander')
const xTime = require('x-time')
const spawn = require('child_process').spawn
const Tail = require('tail').Tail
const leftpad = require('leftpad')
const rightpad = require('rightpad')

const z1 = require('./../remote/index')
const pack = require('./../package.json')
const spam = require('./message')
const features = require('./features')
const parser = require('./parser')


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
    spam.start()
    return z1.resurrect().then(data => {
      spam.stop()
      console.log('workers started:', data.started)
    }).catch(handle)
  })

program
  .command('start [dir]')
  .usage('[options] [dir] [-- [arguments]]')
  .description('start the app in the dir')
  .option('-n, --name <name>', 'name of your app')
  .option('-p, --ports <ports>', 'ports that your app listens to', parser.ports)
  .option('-w, --workers <workers>', 'count of workers (default: number of CPUs)', parseInt)
  .option('-o, --output <output>', 'directory for the log files of this app', parser.path)
  .option('-e, --env <env>', 'environment variables e.g. NODE_ENV=development', parser.env)
  .action((dir, opts) => {

    // prepare opts
    const opt = {
      name: opts.name,
      workers: opts.workers,
      ports: opts.ports,
      output: opts.output
    }

    // parse environment variables
    const env = Object.assign({}, process.env, opts.env)

    spam.start()
    return z1.start(dir, args, opt, env).then(data => {
      spam.stop()
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
    spam.start()
    return z1.stop(appName, opt).then(data => {
      spam.stop()
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
    spam.start()
    return z1.restart(appName, opt).then(data => {
      spam.stop()
      console.log('name:', data.app)
      console.log('ports:', data.ports.join())
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })

program
  .command('restart-all')
  .description('restart all apps')
  .option('-t, --timeout <timeout>', 'time until the old workers get killed')
  .option('-s, --signal <signal>', 'kill signal for the old workers')
  .action(opts => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    spam.start()
    return z1.restartAll(opt).then(data => {
      spam.stop()
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })

program
  .command('logs [appName]')
  .description('show the output of an app')
  .action((appName = getAppName()) => {
    const configPath = path.join(process.env.HOME, '.z1', 'config.json')

    let config = null
    try {
      config = require(configPath)
    } catch(err) {
      handle(new Error('config.json not found'))
    }

    let streams = []
    let oldFiles = []

    const app = config.apps.find(e => e.name === appName)

    const output = (app && app.opt.output) || path.join(process.env.HOME, '.z1', appName)

    updateLogs()
    setInterval(updateLogs, 5000)

    function updateLogs() {
      fs.readdir(output, (err, files) => {
        if(err) {
          if(err.code === 'ENOENT') {
            handle(new Error(`app "${appName}" not found`))
          } else {
            handle(err)
          }
        }

        files = files.sort().slice(-2)

        if(oldFiles.join() === files.join()) {
          return
        }

        // stop old streams
        streams.forEach(stream => {
          stream.unwatch()
        })

        oldFiles = files

        if(!files.length) {
          return
        }

        // add new streams
        streams = files.map(file => {
          const stream = new Tail(path.join(output, file))
          stream.on('line', line => {
            console.log(line)
          })
          stream.on('error', handle)
          stream.watch()

          return stream
        })
      })
    }
  })


program
  .command('info [appName]')
  .description('show specific infos about an app')
  .action((appName = getAppName()) => {
    z1.info(appName).then(stats => {
      console.log('name:', stats.name)
      console.log('directory:', stats.dir)
      console.log('ports:', stats.ports.join())
      console.log('workers:')
      console.log('  pending:', stats.pending)
      console.log('  available:', stats.available)
      console.log('  killed:', stats.killed)
      console.log('revive cound:', stats.reviveCount)
    })
  })

program
  .command('list')
  .description('overview of all running workers')
  .option('-m, --minimal', 'minimalistic list (easy to parse)')
  .action(opt => {
    return z1.list().then(data => {
      const props = Object.keys(data.stats)

      if(opt.minimal) {
        console.log(props.join(' '))
        return
      }

      if(!props.length) {
        console.log('no workers running')
        return
      }

      const max = process.stdout.columns

      console.log(' workers name                 ports')
      for(const prop of props) {
        const obj = data.stats[prop]
        const p = leftpad(obj.pending, 2)
        const a = leftpad(obj.available, 2)
        const k = leftpad(obj.killed, 2)
        const name = rightpad(prop, 20)
        const ports = obj.ports.join()
        console.log(p, a, k, name, ports)
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
  log('no appName given')
  log('searching directory for package.json')
  try {
    const file = path.join(process.cwd(), 'package.json')
    const pack = require(file)
    assert(pack.name)
    log(`found name "${pack.name}" in package.json`)
    return pack.name
  } catch(err) {
    console.error(`no package.json file found`)
    handle(new Error('missing argument `appName\''))
  }
}

function log(...msg) {
  if(process.env.DEBUG) {
    console.log(...msg)
  }
}

function handle(err) {
  if(process.env.DEBUG) {
    console.error(err)
  } else {
    console.error(`\n  error: ${err.message}\n`)
  }
  process.exit(1)
}
