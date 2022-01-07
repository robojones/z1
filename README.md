# z1

[![CircleCI](https://circleci.com/gh/robojones/z1.svg?style=svg)](https://circleci.com/gh/robojones/z1)

__z1__ is a Node.js cluster management program. It works on Linux Debian, Ubuntu, and other Debian based distributions.

When using Node.js on a __web server__, one will somehow come to the point where he wants to start __multiple
processes__ for one app. The main goal of z1 is to __simplify__ the creation and management of Node.js processes.

![Terminal example](https://raw.githubusercontent.com/robojones/z1/master/screenshots/terminal.gif)

_This animation shows how simple it is to start a Node.js application with z1._

## Table of contents

- [Features](#features)
- [Setup](#setup)
    - [Installation](#installation)
    - [Automatically resurrect z1](#automatically-resurrect-z1)
    - [Prepare package.json](#prepare-packagejson)
    - [Development](#development)
- [CLI](#cli)
    - [Environment variables](#environment-variables)
    - [Start](#start)
    - [Restart](#restart)
    - [List](#list)
    - [Info](#info)
    - [Stop](#stop)
    - [Exit](#exit)
    - [Resurrect](#resurrect)
    - [Install and Uninstall](#install-and-uninstall)
    - [Passing arguments to workers](#passing-arguments-to-workers)
- [API](#api)
    - [z1.start](#z1startdir-args-opt-env-immediate)
    - [z1.restart](#z1restartapp-opt-immediate)
    - [z1.stop](#z1stopapp-opt-immediate)
    - [z1.info](#z1infoapp)
    - [z1.list](#z1list)
    - [z1.exit](#z1exit)
    - [z1.resurrect](#z1resurrectimmediate)
    - [z1.ready](#z1ready)

## Changes

- v4.0.0
    - use [revents](https://npmjs.com/package/revents) for data transmission between the CLI and the daemon.
    - `Ctrl + C` can now be used to abort the starting process of apps.
    - remove upgrade command.
- v3.17.0
    - add [WORKERS](#environment-variables) environment variable
- v3.16.0
    - add colors to cli
- v3.15.0
    - display the app's logs during command execution
- v3.14.0
    - add JSDoc to API

## Setup

### Installation

Via [NPM](https://npmjs.com)

```
sudo npm install z1 -g
```

__Note:__
You might want to run `z1 resurrect` automatically after rebooting your system. It will start the z1 daemon and all the
apps that were running before.
(see: [install command](#install-and-uninstall))

### Prepare package.json

Before you can start your Node.js app, you need to add a few things to your
`package.json` file.

1. __name__ - The name of your app.
2. __main__ - The entry point of your app (The file that you would normally run with (`node <file>`).
3. __ports__ _(optional)_ - An array of port numbers that your app uses.
4. __workers__ _(optional)_ - A number specifying how many processes should be created for your app. The default value
   is the number of CPU-cores in your system.
5. __output__ _(optional)_ - A directory for the log and error files. (Default: `~/.z1/<yourAppname>`)
6. __devPorts__ _(optional)_ - Ports for [development](#development)
7. __devWorkers__ _(optional)_ - Workers for [development](#development)

__Important:__
z1 needs to know when your Node.js program (e.g. a web server) is successfully started. If you app uses ports, z1 will
automatically know when it listens to all the specified ports. It will then assume, that you app is completely started.
__If you app does not use any ports, you must require z1 in your program and call the [z1.ready()](#z1ready) method.__

Example package.json file:

```json
{
  "name": "homepage",
  "main": "index.js",
  "ports": [8080],
  "workers": 2
}
```

### Development

If you are running z1 locally, you can set `NODE_ENV=development`. This will cause z1 to use the `devPorts`
and `devWorkers` (if specified) instead of the `ports` and `workers` properties from the `package.json`. The __default
timeout__ for stop and restart will be set to __0ms__.

## CLI

### Environment variables

You can set different environment variables for each app. The [start](#start) command automatically applies the
environment variables of the current shell to the app.

```
EXAMPLE=hello z1 start path/to/your/app
```

There are some environment variables that automatically z1 sets for each process:

- __PORT__ - The first port you specified.
- __PORTS__ - All ports that your app uses (separated by commas).
- __APPNAME__ - The name of your app.
- __PWD__ - The directory of your app.
- __WORKERS__ - The number of workers started for the app.

These variables __can't be overwritten__.

### Start

After you [prepared the package.json](#prepare-packagejson) file of your app, you can now start it. First go to the
directory where the `package.json` of your project is located. Type the following command into your terminal:

```
z1 start
```

This command works regardless of how many workers you have specified in the `package.json` file. If your app was
successfully startet, the output should look like this:

![Start command output](https://raw.githubusercontent.com/robojones/z1/master/screenshots/start.png)

_As you may have noticed, each log is displayed twice. This happens because two workers are started for the app and the
logs of all workers are being displayed._

__Options__

If you want to start your app with different settings than the ones specified in the `package.json`, you can add them to
to the `z1 start` command.

```
--name anotherName
--ports 80,2020,8080
--workers 4
--output path/to/logs/
```

### Restart

You can restart your app to apply updates for your app or changes to the `package.json`. The restart process will be __
gapless__ and no requests will be refused. Just type the following command:

```
z1 restart homepage
```

The first argument for the `z1 restart` command is the name that was specified in the `package.json` when you started
the app. If you are running this command inside the directory of the Node.js application, z1 will automatically detect
the name.

Output of the example from above:

![Restart command output](https://raw.githubusercontent.com/robojones/z1/master/screenshots/restart.png)

__Options__

```
--timeout 10000
```

`--timeout` is a number specifying the maximal time (in ms) that the old workers can __continue to run__ after they are
killed. The timeout allows old processes to __finish their active requests__ while not accepting new ones. If all
requests are finished, or the timeout is exceeded, the old processes get killed. The default value is 30000 (30s). If
you set it to "Infinity" the old processes might run forever.

### List

```
z1 list
```

Displays a list of all running apps.

The output could look like this:

![List command output](https://raw.githubusercontent.com/robojones/z1/master/screenshots/list.png)

### Info

```
z1 info homepage
```

Shows more detailed information than z1 list.

Example output:

![Info command output](https://raw.githubusercontent.com/robojones/z1/master/screenshots/info.png)

- __pending__ - processes are currently starting.
- __available__ - workers are listening to all the ports specified in the `package.json`
- __killed__ - workers are not listening for new connections. They will finish their outstanding requests before they
  exit.
- __revive count__ - shows you how often the workers of your app crashed since the last restart.

__Options:__

- `--name` - output the appname
- `--dir` - output the directory of the app
- `--ports` - output the ports that the app uses
- `--pending` - output the number of pending workers
- `--available` - output the number of available workers
- `--killed` - output the number of killed workers
- `--revive-count` - output how often the app has been revived

### Stop

To stop an app just type:

```
z1 stop homepage
```

Example output:

![Stop command output](https://raw.githubusercontent.com/robojones/z1/master/screenshots/stop.png)

__Options__

```
--timeout 10000
```

`--timeout` is a number specifying the maximal time that the workers are allowed to run after they are killed (in ms).
The default value is 30,000ms. If you set it to "infinity" the old processes might run forever.

### Exit

```
z1 exit
```

This will kill the z1 daemon process and therefore all apps and workers.

### Resurrect

After you typed [exit](#exit), you can use the following to start all the apps that were running before:

```
z1 resurrect
```

Note: If you are starting a new app before `z1 resurrect`, the old apps will not be restored.

### Install and Uninstall

This command allows you to add and remove additional features.

1. __zsh__ - shell completion for zsh
2. __bash__ - shell completion for bash _(coming soon)_
3. __cron__ - cron job that resurrects z1 after a reboot

```
sudo z1 install zsh
```

### Passing arguments to workers

You can start your app with custom arguments.

```
z1 start --name 'custom app' --ports 80 -- hello
```

This would start an app with the name 'custom app' that is listening on port 80. Everything behind the `--` will be
passed to the workers. In your code you can get the "hello" as argv.

```javascript
process.argv[2] === 'hello' // true
```

## API

Besides the CLI, you can also __require__ z1 to control your apps with a Node.js program.

```javascript
const z1 = require('z1')
```

### z1.start(dir, args, opt, env, immediate)

__Arguments__

- __dir__ `<String>` - Path to the directory where the `package.json` of the app is located (Default: current directory)
- __args__ `<Array>` _(optional)_ - Arguments for the workers
- __opt__ `<Object>` _(optional)_ - Options that overwrite the ones from the [package.json](#prepare-packagejson)
- __env__ `<Object>` _(optional)_ - Key-value-pairs to be added to `process.env` in the workers.
- __immediate__ `<Boolean>` _(optional)_ (Default: `false`)

__Returns__ a `<Promise>` that gets resolved when the app is started. If you set __immediate__ to `true`, the promise
gets resolved immediately after your command was transmitted to the daemon.

By default It resolves to an object with the following data:

```javascript
{
  app: String,
  dir: String,
  started: Number
}
```

- __app__ - The name of the app specified in the `package.json`. You will need this in order to restart/stop the app.
- __dir__ - Absolute path to the directory where the `package.json` is located
- __started__ - Number of workers started for this app

### z1.restart(app, opt, immediate)

__Arguments__

- __app__ `<String>` - The name specified in the `package.json` of the app you want to restart.
- __opt__ `<Object>` - _(optional)_
    - __timeout__ `<Number>` - Maximum time until the old workers get killed (default: 30000ms).
    - __signal__ `<String>` - Kill signal for the old workers
- __immediate__ `<Boolean>` _(optional)_ (Default: `false`)

__Returns__ a `<Promise>` that gets resolved when the new workers are available and the old ones are killed. It resolves
to an object with the following data:

```javascript
{
  app: String,
  dir: String,
  started: Number,
  killed: Number
}
```

- __app__ - the app name
- __dir__ - directory of the app
- __started__ - Number of started workers
- __killed__ - Number of killed workers

### z1.stop(app, opt, immediate)

__Arguments__

- __app__ `<String>` The name specified in the `package.json` of the app you want to restart.
- __opt__ `<Object>` _(optional)_
    - __timeout__ `<Number>` Maximum time until the old workers get killed (default: 30000ms).
    - __signal__ `<String>` Kill signal
- __immediate__ `<Boolean>` _(optional)_ (Default: `false`)

__Returns__ a `<Promise>` that gets resolved when the old workers are killed. It resolves to an object with the
following data:

```javascript
{
  app: String,
  killed: Number
}
```

- __app__ - the app name
- __killed__ - Number of killed workers

### z1.info(app)

__Arguments__

- __app__ `<String>` The name of your app.

__Returns__ a `<Promise>` that gets resolved to an object that contains information about the app.

Example:

```javascript
{
  name: 'homepage',
  reviveCount: 0,
  ports: [80],
  pending: 0,
  available: 2,
  killed: 0
}
```

### z1.list()

__Returns__ a `<Promise>` that resolves to an object containing data about all running workers.

You can access the data for an app by using the name as key:

```javascript
z1.list().then(data => {
  console.log(data.stats)
})
```

The output would be:

```javascript
{
  homepage: {
    dir: '/home/user/apps/homepage',
    ports: [80],
    pending: 0,
    available: 2,
    killed: 0
  }
}
```

### z1.exit()

__Returns__ a `<Promise>` that resolves to an empty object. It gets resolves after the z1 daemon has exited.

### z1.resurrect(immediate)

- __immediate__ `<Boolean>` _(optional)_ (Default: `false`)

__Returns__ a `<Promise>` that resolves to an object.

Example:

```javascript
{
  started: 2 // two workers started
}
```

It will be rejected if `z1.resurrect()` or `z1.start()` was called before.

Resurrect will start all apps that were running before the daemon was killed.

### z1.ready()

__Returns__ a `<Promise>` that resolves when the ready signal has been transmitted.

This function __must__ be called if an app does not use any port. It will tell the z1 daemon that your app has been
started successfully.

Example:

```javascript
const z1 = require('z1')

// ...your program...

z1.ready()
```
