#! /usr/bin/env node

const fs = require('fs')
const path = require('path')
const assert = require('assert')
const program = require('commander')
const spawn = require('child_process').spawn
const Tail = require('tail').Tail
const leftpad = require('leftpad')
const rightpad = require('rightpad')

const z1 = require('./../remote/index')
const spam = require('./message')
const features = require('./features')
const parser = require('./parser')
const version = require('./version')

const SPACER = '--'

const argv = process.argv.slice()
let args = []
if (argv.includes(SPACER)) {
  args = argv.splice(argv.indexOf(SPACER))
  args.shift()
}

program
  .version(version.string)
  .option('-V <version>', 'version')
  .action(function (cmd) {
    handle(new Error(`command "${cmd}" not found`))
  })

program
  .command('resurrect')
  .description('start the apps that were started before exit')
  .option('-i, --immediate', 'exit immediately')
  .action((opts) => {
    spam.start()
    z1.resurrect(opts.immediate).then(data => {
      spam.stop()
      if (opts.immediate) return
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
  .option('-i, --immediate', 'exit immediately')
  .action((dir, opts) => {
    // prepare opts
    const opt = {
      name: opts.name,
      workers: opts.workers,
      ports: opts.ports,
      output: opts.output
    }

    const env = {}

    spam.start()
    z1.start(dir, args, opt, env, opts.immediate).then(data => {
      spam.stop()
      if (opts.immediate) return
      console.log('name:', data.app)
      console.log('ports:', data.ports.join() || '-')
      console.log('workers started:', data.started)
    }).catch(handle)
  })

program
  .command('stop [appName]')
  .description('stop the app specified by the appName')
  .option('-t, --timeout <timeout>', 'time until the workers get killed')
  .option('-s, --signal <signal>', 'kill signal')
  .option('-i, --immediate', 'exit immediately')
  .action((appName = getAppName(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    spam.start()
    z1.stop(appName, opt, opts.immediate).then(data => {
      spam.stop()
      if (opts.immediate) return
      console.log('name:', data.app)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })

program
  .command('restart [appName]')
  .description('restart the app specified by the appName')
  .option('-t, --timeout <timeout>', 'time until the old workers get killed')
  .option('-s, --signal <signal>', 'kill signal for the old workers')
  .option('-i, --immediate', 'exit immediately')
  .action((appName = getAppName(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    spam.start()
    z1.restart(appName, opt, opts.immediate).then(data => {
      spam.stop()
      if (opts.immediate) return
      console.log('name:', data.app)
      console.log('ports:', data.ports.join() || '-')
      console.log('workers started:', data.started)
      console.log('workers killed:', data.killed)
    }).catch(handle)
  })

program
  .command('restart-all')
  .description('restart all apps')
  .option('-t, --timeout <timeout>', 'time until the old workers get killed')
  .option('-s, --signal <signal>', 'kill signal for the old workers')
  .option('-i, --immediate', 'exit immediately')
  .action(opts => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    spam.start()
    z1.restartAll(opt, opts.immediate).then(data => {
      spam.stop()
      if (opts.immediate) return
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
    } catch (err) {
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
        if (err) {
          if (err.code === 'ENOENT') {
            handle(new Error(`app "${appName}" not found`))
          } else {
            handle(err)
          }
        }

        files = files.sort().slice(-2)

        if (oldFiles.join() === files.join()) {
          return
        }

        // stop old streams
        streams.forEach(stream => {
          stream.unwatch()
        })

        oldFiles = files

        if (!files.length) {
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
  .option('--name', 'output the appName')
  .option('--dir', 'output the directory of the app')
  .option('--ports', 'output the ports that the app uses')
  .option('--pending', 'output the number of pending workers')
  .option('--available', 'output the number of available workers')
  .option('--killed', 'output the number of killed workers')
  .option('--revive-count', 'output how often the app has been revived')
  .action((appName = getAppName(), opts) => {
    z1.info(appName).then(stats => {
      const props = ['name', 'dir', 'ports', 'pending', 'available', 'killed', 'reviveCount']
      const prop = props.find(prop => opts.hasOwnProperty(prop))
      if (prop) {
        const value = stats[prop]
        if (Array.isArray(value)) {
          console.log(value.join() || '-')
        } else {
          console.log(value)
        }
        process.exit(0)
      }

      console.log('name:', stats.name)
      console.log('directory:', stats.dir)
      console.log('ports:', stats.ports.join() || '-')
      console.log('workers:')
      console.log('  pending:', stats.pending)
      console.log('  available:', stats.available)
      console.log('  killed:', stats.killed)
      console.log('revive count:', stats.reviveCount)
    }).catch(handle)
  })

program
  .command('list')
  .description('overview of all running workers')
  .option('-m, --minimal', 'minimalistic list (easy to parse)')
  .action(opt => {
    z1.list().then(data => {
      const props = Object.keys(data.stats)

      if (opt.minimal) {
        console.log(props.join(' '))
        return
      }

      if (!props.length) {
        console.log('no workers running')
        return
      }

      console.log('workers  name                 ports')
      for (const prop of props) {
        const obj = data.stats[prop]
        const p = leftpad(obj.pending, 2, ' ')
        const a = leftpad(obj.available, 2, ' ')
        const k = leftpad(obj.killed, 2, ' ')
        const name = rightpad(prop, 20)
        const ports = obj.ports.join() || '-'
        console.log(p, a, k, name, ports)
      }
      console.log(' |  |  |')
      console.log(' |  | killed')
      console.log(' | available')
      console.log('pending')

      if (data.isResurrectable) {
        console.log('\nThe listed apps are currently not running.\nType "z1 resurrect" to start them.')
      }
    }).catch(handle)
  })

program
  .command('exit')
  .description('kill the z1 daemon')
  .action(() => {
    z1.exit().then(() => {
      console.log('daemon stopped')
    }).catch(handle)
  })

program
  .command('install [feature]')
  .description('install additional features')
  .option('-m, --minimal', 'minimalistic list (easy to parse)')
  .action((feature, opts) => {
    const folder = path.join(__dirname, '..', 'script', 'install')

    if (opts.minimal) {
      Object.keys(features).forEach((feature, i, list) => {
        process.stdout.write(feature)
        if (list[i + 1]) {
          process.stdout.write(' ')
        }
      })
      process.stdout.write('\n')
    } else if (!feature) {
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
  .action(feature => {
    const folder = path.join(__dirname, '..', 'script', 'uninstall')

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

program
  .command('upgrade')
  .description('upgrade daemon to a newly installed version')
  .action(() => {
    if (version.cli === version.daemon) {
      console.log('already up-to-date')
      return
    }

    z1.upgrade().then(() => {
      console.log('upgrade successful')
    }).catch(handle)
  })

if (!global.test) {
  if (process.argv.length === 2) {
    program.outputHelp()
  }

  program.parse(argv)
}

function getAppName() {
  log('no appName given')
  log('searching directory for package.json')
  try {
    const file = path.join(process.cwd(), 'package.json')
    const pack = require(file)
    assert(pack.name)
    log(`found name "${pack.name}" in package.json`)
    return pack.name
  } catch (err) {
    console.error(`no package.json file found`)
    handle(new Error('missing argument `appName\''))
  }
}

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
