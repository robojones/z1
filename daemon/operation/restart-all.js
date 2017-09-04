const restart = require('./restart')

module.exports = function restartAll(config, command, connection) {
  const q = []

  config.apps.forEach(app => {
    const cmd = Object.assign({}, command, {
      app: app.name
    })

    q.push(restart(config, cmd, connection))
  })

  return Promise.all(q).then(stats => {
    return stats.reduce((a, b) => {
      a.started += b.started
      a.killed += b.killed
      return a
    }, {
      started: 0,
      killed: 0
    })
  })
}
