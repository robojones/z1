# z1

## Usage

### Setup

To start the z1 daemon run the following command:
```
z1 resurrect
```

Note: You might want to add this to your startup applications. It will start all apps that were running when the daemon was killed.

To kill z1 type:
```
z1 exit
```


### Start

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

You can restart your app to apply updates or changes to your `package.json`. Just type the following command:

```
z1 restart homepage 3000
```

The first argument for the `z1 restart` command is the app name, that was in the `package.json` when you started the app. The second argument is optional. It is a number specifying the maximal time that the old workers are allowed to run after they are killed (in ms). If you don't provide this argument the old processes might run forever.

Output of the example from above:
```
restarted
name: homepage
workers started: 2
workers killed: 2
```

### Stop

To stop a app just type:

```
z1 stop homepage
```

Example output:
```
killed
name: homepage
workers killed: 2
```
