#! /usr/bin/env node

const path = require('path')
const util = require('util')
const program = require('commander')
const spawn = require('child_process').spawn
const colors = require('colors/safe')

// initialize global.handle and global.log methods
require('./lib/logs')

const z1 = require('..')
const getAppname = require('./lib/get-appname.js')
const features = require('./lib/features')
const parser = require('./lib/parser')
const version = require('./lib/version')
const z1Logs = require('./lib/z1-logs')
const heading = require('./lib/heading')
const logResult = require('./lib/log-result')

const SPACER = '--'

const argv = process.argv.slice()
let args = []
if (argv.includes(SPACER)) {
  args = argv.splice(argv.indexOf(SPACER))
  args.shift()
}

z1Logs(z1)

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
    z1.resurrect(opts.immediate).then(data => {
      if (opts.immediate) return
      logResult(data)
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

    z1.start(dir, args, opt, env, opts.immediate).then(data => {
      if (opts.immediate) return
      logResult(data)
    }).catch(handle)
  })

program
  .command('stop [appname]')
  .description('stop the app specified by the appname')
  .option('-t, --timeout <timeout>', 'time until the workers get killed')
  .option('-s, --signal <signal>', 'kill signal')
  .option('-i, --immediate', 'exit immediately')
  .action((appname = getAppname(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    z1.stop(appname, opt, opts.immediate).then(data => {
      if (opts.immediate) return
      logResult(data)
    }).catch(handle)
  })

program
  .command('restart [appname]')
  .description('restart the app specified by the appname')
  .option('-t, --timeout <timeout>', 'time until the old workers get killed')
  .option('-s, --signal <signal>', 'kill signal for the old workers')
  .option('-i, --immediate', 'exit immediately')
  .action((appname = getAppname(), opts) => {
    const opt = {
      timeout: opts.timeout,
      signal: opts.signal
    }
    z1.restart(appname, opt, opts.immediate).then(data => {
      if (opts.immediate) return
      logResult(data)
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
    z1.restartAll(opt, opts.immediate).then(data => {
      if (opts.immediate) return
      logResult(data)
    }).catch(handle)
  })

program
  .command('logs [appname]')
  .description('show the output of an app')
  .action((appname = getAppname()) => {
    z1.logs(appname).catch(handle)
  })

program
  .command('info [appname]')
  .description('show specific infos about an app')
  .option('--name', 'output the appname')
  .option('--dir', 'output the directory of the app')
  .option('--ports', 'output the ports that the app uses')
  .option('--pending', 'output the number of pending workers')
  .option('--available', 'output the number of available workers')
  .option('--killed', 'output the number of killed workers')
  .option('--revive-count', 'output how often the app has been revived')
  .action((appname = getAppname(), opts) => {
    z1.info(appname).then(stats => {
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

      heading('workers ports     name                 directory')

      props.forEach(name => {
        const app = data.stats[name]

        let workers = colors.bold(`${app.available}/${app.workers}`.padEnd(7))
        if (app.available < app.workers) {
          workers = colors.red(workers)
        } else if (app.available > app.workers) {
          workers = colors.yellow(workers)
        } else {
          workers = colors.green(workers)
        }

        const ports = app.ports.join() || '-'

        console.log(`${workers} ${ports.padEnd(9)} ${name.padEnd(20)} ${app.dir}`)
      })

      if (data.isResurrectable) {
        console.log()
        console.log(colors.dim('The listed apps are currently not running.'))
        console.log(colors.dim('You can use "z1 resurrect" to start them.'))
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

<<<<<<< HEAD
program
  .command('upgrade')
  .description('upgrade daemon to a newly installed version')
  .action(util.deprecate(() => {
    if (version.cli === version.daemon) {
      console.log('already up-to-date')
      return
    }

    z1.upgrade().then(() => {
      console.log('upgrade successful')
    }).catch(handle)
  }, 'z1 upgrade - Use "z1 exit && z1 resurrect" or "pkill node && z1 resurrect" instead.'))

=======
>>>>>>> revents
if (!global.test) {
  if (process.argv.length === 2) {
    program.outputHelp()
  }

  program.parse(argv)
}
