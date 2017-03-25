# z1

__z1__ is a Node.js cluster management program.
When using Node.js on a __web server__, one will somehow come to the point where he wants to start __multiple processes__ for one app.
The main goal of z1 is to __simplify__ the creation and management of clusters.

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
  - [Stop](#stop)
  - [Exit](#exit)
  - [Resurrect](#resurrect)
  - [Passing arguments to workers](#passing-arguments-to-workers)
  - [Install and Uninstall](#install-and-uninstall)
- [API](#api)
  - [z1.start](#z1startdir-args-opt-env)
  - [z1.restart](#z1restartapp-opt)
  - [z1.stop](#z1stopapp-opt)
  - [z1.list](#z1list)
  - [z1.exit](#z1exit)
  - [z1.resurrect](#z1resurrect)

## Features
The focus of z1 is on simplicity.
Therefore it uses the __existing package.json__ of your project and allows you to start your app by typing `z1 start` in the project folder.
z1 also comes with a __graceful restart__ functionality which allows you to restart your cluster without rejecting any request.

## Setup

### Installation

Via [NPM](https://npmjs.com)

```
sudo npm install z1 -g
```

__Note:__
You might want to run `z1 resurrect` automatically after rebooting your system.
It will start the z1 daemon and all the apps that were running before.
(see: [install command](#install))

### Prepare package.json

Before you can cluster your Node.js app,
you need to add a few things to your
`package.json` file.

1. __name__ - your app name
2. __main__ - the entry point of your app
3. __ports__ - an array of port numbers that your app uses
4. __workers__ _(optional)_ - a number specifying how many workers should be created for your app. the default value is the number of CPU-cores in your system.
5. __output__ _(optional)_ - a directory for the log and error files. (Default: `~/.z1/<yourAppName>`)
6. __devPorts__ _(optional)_ ports for [development](#development)

Example:

```json
{
  "name": "homepage",
  "main": "index.js",
  "ports": [80],
  "workers": 2
}
```

### Development

If you are running z1 locally, you can set the `NODE_ENV` environment variable to `'development'`.
This will cause z1 to use the `devPorts` (if specified) instead of the `ports` property from the `package.json`.
The default timeout for __stop__ and __restart__ will be set to 0ms.


## CLI

### Environment variables

You can set different environment variables for each app.
The [start](#start) command automatically applies the environment variables of the current CLI to the app.

```
export EXAMPLE=hello && z1 start path/to/your/app
```

There are some environment variables that z1 sets automatically:

- __PORT__ - the first port
- __APPNAME__ - the name of your app
- __PWD__ - the directory of your app

These variables can not be overwritten.

### Start

Starting the app:
First go to the directory where the `package.json` is located. Type the following command into your terminal:

```
z1 start
```

In our example the output would be:

```
started
name: homepage
workers started: 2
```

__options__

If you want to start your app with different settings
than the ones specified in the `package.json`,
you can add them to to the `z1 start` command.

```
--name anotherName
--ports 80,2020,8080
--workers 4
--output path/to/logs/
```

### Restart

You can restart your app to apply updates for your app or changes to the `package.json`.
The restart process will be gapless and no requests will be refused.
Just type the following command:

```
z1 restart homepage
```

The first argument for the `z1 restart` command is the app name that was in the `package.json` when you started the app.

Output of the example from above:

```
restarted
name: homepage
workers started: 2
workers killed: 2
```

__options__

```
--timeout 10000
```

`--timeout` is a number specifying the maximal time that the old workers are allowed to run after they are killed (in ms). The default value is 30000 (30s). If you set it to "infinity" the old processes might run forever.

### List

```
z1 list
```

Displays a list of all running apps.

Example:

```
 workers name                 directory
 0  2  0 homepage             /home/jones/apps/homepage
 |  |  |
 |  | killed
 | available
pending
```

1. __Pending__ processes are currently starting.
2. __Available__ workers are listening to all the ports specified in the `package.json`
3. __Killed__ workers are not listening for new connections.
They will finish their outstanding requests before they exit.

### Stop

To stop an app just type:

```
z1 stop homepage
```

Example output:

```
stopped
workers killed: 2
```

__options__

```
--timeout 10000
```

`--timeout` is a number specifying the maximal time that the workers are allowed to run after they are killed (in ms). The default value is 30,000ms. If you set it to "infinity" the old processes might run forever.

### Exit

```
z1 exit
```

Will kill the z1 daemon process and therefore all apps and workers.

### Resurrect

After you typed exit, you can use the following to start all the apps that were running before:

```
z1 resurrect
```

Note: If you are starting a new app before `z1 resurrect`, the old apps will not be restored.

### Passing arguments to workers

You can start your app with custom arguments.

```
z1 start --name 'custom app' --ports 80 -- hello
```

This would start an app with the name 'custom app' that is listening on port 80.
Everything behind the `--` will be passed to the workers.
In your code you can get the "hello" as argv.

```javascript
process.argv[2] === 'hello' // true
```

### Install and Uninstall

This command allows you to add and remove additional features.

1. __zsh__ - shell completion for zsh
2. __bash__ - shell completion for bash _(coming soon)_
3. __cron__ - cron job that resurrects z1 after a reboot


## API

Besides the CLI, you can also __require__ z1 to control your apps with a Node.js program.

```javascript
const z1 = require('z1')
```

### z1.start(dir, args, opt, env)

__Arguments__
- __dir__ `<String>` Path to the directory where the `package.json` of the app is located (default: current directory)
- __args__ `<Array>` _(optional)_ Arguments for the workers
- __opt__ `<Object>` _(optional)_ Options that overwrite the ones from the [package.json](#prepare-packagejson)
- __env__ `<Object>` _(optional)_ Key-value-pairs to be added to `process.env` in the workers.

__Returns__ a `<Promise>` that gets resolved when the app is started. It resolves to an object with the following data:

```javascript
{
  app: String,
  dir: String,
  started: Number
}
```

- __app__ The name of the app specified in the `package.json`. You will need this in order to restart/stop the app.
- __dir__ Absolute path to the directory where the `package.json` is located
- __started__ Number of workers started for this app

### z1.restart(app, opt)

__Arguments__
- __app__ `<String>` The name specified in the `package.json` of the app you want to restart.
- __opt__ `<Object>` _(optional)_
  - __timeout__ `<Number>` Maximum time until the old workers get killed (default: 30000ms).
  - __signal__ `<String>` Kill signal for the old workers

__Returns__ a `<Promise>` that gets resolved when the new workers are available and the old ones are killed. It resolves to an object with the following data:

```javascript
{
  app: String,
  dir: String,
  started: Number,
  killed: Number
}
```

- __app__ the app name
- __dir__ directory of the app
- __started__ Number of started workers
- __killed__ Number of killed workers

### z1.stop(app, opt)

__Arguments__
- __app__ `<String>` The name specified in the `package.json` of the app you want to restart.
- __opt__ `<Object>` _(optional)_
  - __timeout__ `<Number>` Maximum time until the old workers get killed (default: 30000ms).
  - __signal__ `<String>` Kill signal

__Returns__ a `<Promise>` that gets resolved when the old workers are killed. It resolves to an object with the following data:

```javascript
{
  app: Number,
  killed: Number
}
```

- __app__ the app name
- __killed__ Number of killed workers

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
    dir: '/home/jones/apps/homepage',
    pending: 0,
    available: 2,
    killed: 0
  }
}
```

### z1.exit()

__Returns__ a `<Promise>` that resolves to an empty object. It gets resolves after the z1 daemon has exited.

### z1.resurrect()

__Returns__ a `<Promise>` that resolves to an object.

Example:

```javascript
{
  started: 2 // two workers started
}
```

It will be rejected if `z1.resurrect()` or `z1.start()` was called before.

Resurrect will start all apps that were running before the daemon was killed.
