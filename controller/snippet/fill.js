function fill(string, space, length) {
  string = string.toString()
  space = space.toString()

  if(!space.length) {
    throw new TypeError('space to short')
  }

  while(string.length < length) {
    string = space + string
  }
  return string
}

module.exports = fill
