const assert = require('assert')
const path = require('path')
const cluster = require('cluster')
const http = require('http')

const killWorkers = test('snippet/killWorkers')

const pwd = process.env.PWD

describe('Worker', function () {

  const Worker = local('daemon/class/Worker')

  it('should be a class (function)', function () {
    assert.strictEqual(typeof Worker, 'function')
  })

  describe('.workers', function () {
    it('should be an Object', function () {
      assert.strictEqual(typeof Worker.workers, 'object')
    })
  })

  describe('.workerList', function () {
    it('should be an Array', function () {
      assert(Array.isArray(Worker.workerList))
    })
  })

  describe('.PENDING', function () {
    it('should be 0', function () {
      assert.strictEqual(Worker.PENDING, 0)
    })
  })

  describe('.AVAILABLE', function () {
    it('should be 1', function () {
      assert.strictEqual(Worker.AVAILABLE, 1)
    })
  })

  describe('.KILLED', function () {
    it('should be 2', function () {
      assert.strictEqual(Worker.KILLED, 2)
    })
  })

  describe('instance', function () {

    beforeEach(function () {
      this.dir = pwd
      this.file = path.join('example', 'server.js')
      this.name = 'exampleApp'
      this.ports = [8080, 8081, 8082]
      this.env = {
        TEST: 'hallo'
      }

      cluster.setupMaster({
        stdio: ['ignore', 'ignore', 'ignore', 'ipc']
      })

      this.worker = new Worker(this.dir, this.file, this.name, this.ports)
    })

    afterEach(killWorkers)

    it('should be in .workers', function () {
      assert(Worker.workers[this.worker.id])
    })

    it('should be in .workerList', function () {
      assert(Worker.workerList.includes(this.worker))
    })

    it('should set .dir to the given directory', function () {
      assert.strictEqual(this.worker.dir, this.dir)
    })

    it('should set .file to the given file(-path)', function () {
      assert.strictEqual(this.worker.file, this.file)
    })

    it('should set .name to the given name', function () {
      assert.strictEqual(this.worker.name, this.name)
    })

    it('should set .ports to ports', function () {
      assert.deepEqual(this.worker.ports, this.ports)
    })

    it('should set .state to PENDING (0)', function () {
      assert.strictEqual(this.worker.state, Worker.PENDING)
    })

    describe('.id', function () {
      it('should be a number', function () {
        assert.strictEqual(typeof this.worker.id, 'number')
      })

      it('should be the id of an existing cluster.Worker', function () {
        assert(cluster.workers[this.worker.id])
      })
    })

    describe('.kill([timeout])', function () {

      beforeEach(function () {
        return this.worker.once('available')
      })

      it('should kill the worker', function () {
        this.worker.kill()
        return this.worker.once('exit')
      })
      it('should set .state to KILLED (2)', function () {
        this.worker.kill()
        assert.deepEqual(this.worker.state, Worker.KILLED)
      })

      it('should force the worker to exit after timeout', function (cb) {
        const timeout = 100

        const options = {
          port: 8081
        }

        const req = http.get(options, res => {
          req.on('error', () => {})

          const start = process.hrtime()

          this.worker.on('exit', (code, sig) => {
            const d = process.hrtime(start)
            const duration = d[0] * 1e3 + d[1] * 1e-6

            assert(duration > timeout, `process exited to early (${duration}ms / ${timeout}ms)`)
            assert(duration < timeout + 100, `process exited to slow (${duration}ms / ${timeout}ms)`)
            cb()
          })

          this.worker.kill(undefined, timeout)
        })
      })
    })

    describe('.w (getter)', function () {
      it('should return the referenced worker', function () {
        assert.deepEqual(this.worker.w, cluster.workers[this.worker.id])
      })
    })

    describe('Event: "available"', function () {
      it('should fire', function () {
        return this.worker.once('available')
      })
      it('should set .state to AVAILABLE (1)', function () {
        return this.worker.once('available').then(() => {
          assert.strictEqual(this.worker.state, Worker.AVAILABLE)
        })
      })
    })

    describe('Event: "exit"', function () {
      it('should fire when worker exits', function () {
        this.worker.kill()
        return this.worker.once('exit')
      })

      it('should have the worker removed from .workers', function () {
        this.worker.kill()
        return this.worker.once('exit').then(() => {
          assert.deepEqual(Worker.workers, {}, 'worker still in .workers')
        })
      })

      it('should have the worker removed from .workerList', function () {
        this.worker.kill()
        return this.worker.once('exit').then(() => {
          assert.deepEqual(Worker.workers, [], 'worker still in .workerList')
        })
      })
    })
  })
})
