const messages = [
  'starting random processes',
  'uploading personal files',
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
  'sleeping for a while',
  'making camp fire',
  'building a tent',
  'gathering stuff',
  'playing pc games',
  'eating hamburger',
  'taking a break',
  'ordering pizza',
  'drinking cola',
  'earning money',
  'being bored',
  'cooking a meal',
  'watching tv',
  'processing tasks',
  'making smoothie',
  'thinking',
  'calculating 1+1=0',
  'sticking a neadle into my hand',
  'uh! that hurts',
  'this takes too long for me',
  'buying brithday gifts',
  'downloading the internet',
  'washing your car',
  'knocking at your door',
  'wrong door - wasn\'t yours.',
  'getting a loaf',
  'progress: 98%',
  'progress: 3%',
  'jumping jumping jumping'
]

let i = Math.round(Math.random() * messages.length - 1)
let interval = null

module.exports = {
  start: () => {
    interval = setInterval(spam, 1000 * 10)
  },
  stop: () => {
    clearInterval(interval)
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
