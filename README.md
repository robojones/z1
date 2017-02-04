# z1


__z1__ is a Node.js cluster management program.
When using Node.js on a __web server__, one will somehow come to the point where he wants to start __multiple processes__ for one app.
The main goal of z1 is to __simplify__ the creation and management of clusters.
Therefore it uses the existing [package.json](#prepare-packagejson) of your project and allows you to start your app by simply typing `z1 start` in the project folder.
z1 also comes with a __graceful restart__ functionality which allows you to restart your cluster without rejecting any request.

## Table of contents

- [Setup](#setup)
  - [Installation](#installation)
  - [Prepare package.json](#prepare-packagejson)
- [CLI](#cli)
  - [Start](#start)
  - [Restart](#restart)
  - [List](#list)
  - [Stop](#stop)
  - [Exit](#exit)
  - [Resurrect](#resurrect)
- [API](#api)
  - [z1.start](#z1startdir)
  - [z1.restart](#z1restartapp-timeout)
  - [z1.stop](#z1stopapp-timeout)
  - [z1.list](#z1list)
  - [z1.exit](#z1exit)
  - [z1.resurrect](#z1resurrect)

## Setup

### Installation

Via [NPM](https://npmjs.com)

```
sudo npm install z1 -g
```

You can verify the installation by starting the example app (see: [example guide](https://github.com/robojones/z1/blob/master/example/start-example.md)).


__Note:__ You might want to add `z1 resurrect` to your startup applications. If you do so, the z1 daemon will start automatically after you reboot your system. It will also start all the apps that were running before.

### Prepare package.json

Before you can cluster your Node.js app,
you need to add a few things to your
`package.json` file.

1. __name__ - your app name
2. __main__ - the entry point of your app
3. __ports__ - an array of port numbers that your app uses
4. __workers__ _(optional)_ - a number specifying how many workers should be created for your app. the default value is the number of CPU-cores in your system.

Example:
```json
{
  "name": "homepage",
  "main": "index.js",
  "ports": [80],
  "workers": 2
}
```

## CLI

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

### Restart

You can restart your app to apply updates for your app or changes to the `package.json`.
The restart process will be gapless and no requests will be refused.
Just type the following command:

```
z1 restart homepage 3000
```

The first argument for the `z1 restart` command is the app name that was in the `package.json` when you started the app. The second argument is optional. It is a number specifying the maximal time that the old workers are allowed to run after they are killed (in ms). The default value is 30000 (30s). If you set it to "infinity" the old processes might run forever.

Output of the example from above:
```
restarted
name: homepage
workers started: 2
workers killed: 2
```

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

## API

Besides the CLI, you can also __require__ z1 to control your apps with a Node.js program.

```javascript
const z1 = require('z1')
```

### z1.start([dir])

__Arguments__
- __dir__ `<String>` Path to the directory where the `package.json` of the app is located

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

### z1.restart(app[, timeout])

__Arguments__
- __app__ `<String>` The name specified in the `package.json` of the app you want to restart.
- __timeout__ `<Number>` Maximum time until the old workers get killed (default: 30000ms).

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

### z1.stop(app[, timeout])

__Arguments__
- __app__ `<String>` The name specified in the `package.json` of the app you want to restart.
- __timeout__ `<Number>` Maximum time until the old workers get killed (default: 30000ms).

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
  console.log(data)
})
```

The output would be:
```javascript
{
  homepage: {
    dir: '/home/jones/apps/homepage',
    file: 'index.js',
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
