# Guide - Start the example app

1. Move to the example app that is included in z1

  ```
  cd $(npm root -g)/z1/example
  ```

2. Start the example app

  ```
  z1 start
  ```

3. Dance around and be happy!
  
## Useful information:
  
If you want to make sure that everything worked you can visit [localhost:8080](http://localhost:8080/) with your browser.

You can also use the list command:

```
z1 list
```

The output should look like that:

```
 workers name                 directory
 0  2  0 exampleApp           /usr/lib/node_modules/z1/example
 |  |  |
 |  | killed
 | available
pending

```

To kill the app you can use the stop command:

```
z1 stop exampleApp
```

See the [README](https://github.com/robojones/z1) for more information.
