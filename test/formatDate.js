const assert = require('assert')

const DATE = new Date(1485029551162)
const ARRAY = ['2017', '01', '21']

describe('Function: formatDate(date[, space])', function () {

  const formatDate = require('./../controller/snippet/formatDate')

  it('should be a function', function () {
    assert.strictEqual(typeof formatDate, 'function')
  })

  it('should format the Number to yyyy-mm-dd', function () {

    assert.strictEqual(formatDate(DATE.getTime()), ARRAY.join('-'))
  })

  it('should format the Date to yyyy-mm-dd', function () {
    assert.strictEqual(formatDate(DATE), ARRAY.join('-'))
  })

  it('should use space as seperator', function () {
    assert.strictEqual(formatDate(DATE, '|'), ARRAY.join('|'))
  })
})
