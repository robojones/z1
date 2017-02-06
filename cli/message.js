const messages = [
  'starting random processes',
  'removing uploading personal files',
  'hacking database',
  'writing an essay',
  'moving to swiss',
  'using cpu',
  'eating fruits',
  'converting images to music',
  'learning how to sing',
  'robbing a bank',
  'flying with an airplane',
  'using disc space',
  'take a break',
  'sleep for a while',
  'making camp fire',
  'building a tent',
  'gathering stuff',
  'playing pc games',
  'eating hamburger',
  'ordering pizza',
  'drinking cola',
  'earning money',
  'beeing bored',
  'cooking a meal',
  'watching tv',
  'processing tasks',
  'making smothie',
  'thinking'
]

let i = Math.round(Math.random() * messages.length)
let interval = null

module.exports = {
  start: () => {
    interval = setInterval(spam, 1000 * 10)
  },
  stop: () => {
    clearInterval(interval)
    console.log('--------')
  }
}

function spam() {
  console.log(message() + '...')
}

function message() {
  if(i === messages.length) {
    i = 0
  }
  return messages[i++]
}
