describe('Class: Remote', function () {
  const z1 = require('../../remote')
  describe('instance', function () {
    describe('#start()', function () {
      it('shoud start the example app.', async function () {
        await z1.start('')
      })
    })
  })
})
