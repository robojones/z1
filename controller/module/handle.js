const fs = require('fs')
const util = require('util')
const path = require('path')

const formatDate = require('./../snippet/formatDate')
const hour = 1000 * 60 * 60

const p = path.resolve()

let out = stream();

function stream(date) {
  return fs.createWriteStream(path.join(p, `z1-error-${formatDate(date)}.txt`), {
    flags: 'a'
  })
}

setInterval(rotate, hour)

function rotate() {
  out.end()
  out = stream()
}

global.handle = function handleError(err) {
  out.write(util.inspect(err) + '\n\n')
}

global.handle.rotate = rotate
