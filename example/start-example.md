# Guide - Start the example app


1. Install z1

  ```
  npm install z1 -g
  ```

  If an error occurs try:

  ```
  sudo npm install z1 -g
  ```

2. Move to the example app that is included in z1

  ```
  cd $(npm root -g)/z1/example
  ```

3. Start the example app

  ```
  z1 start
  ```
  
  __That's it.__
  
  
## Useful information:
  
If you want to make sure that everything worked you can visit [localhost:8080](http://localhost:8080/) with your browser.

You can also use the following command

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
