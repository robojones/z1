const run = test('snippet/run')
const z1 = local('.')

describe('cli', function () {
  this.timeout(10000)

  before(async function () {
    await run('z1 exit')
  })

  beforeEach(function () {
    this._wd = process.cwd()
    process.chdir(local.resolve('example'))
  })

  afterEach(async function () {
    process.chdir(this._wd)
    await run('z1 exit')
  })

  describe('start command', function () {
    it('should start the example app', async function () {
      await run('z1 start')
      await z1.info('exampleApp')
    })

    it('should accept a path as argument', async function () {
      process.chdir('..')
      await run('z1 start example')
      await z1.info('exampleApp')
    })

    describe('-n', function () {
      it('should set the name', async function () {
        await run('z1 start -n customName')
        // this will throw if no matching app was found
        await z1.info('customName')
      })
    })

    describe('--name', function () {
      it('should set the name', async function () {
        await run('z1 start --name customName')
        // this will throw if no matching app was found
        await z1.info('customName')
      })
    })

    describe('-w', function () {
      it('should set amount of workers')
    })

    describe('--workers', function () {
      it('should set amount of workers')
    })

    describe('-p', function () {
      it('should set the ports')
    })

    describe('--ports', function () {
      it('should set the ports')
    })

    describe('-o', function () {
      it('should set the directory for the logs')
    })

    describe('--output', function () {
      it('should set the directory for the logs')
    })
  })

  // describe('')
})
