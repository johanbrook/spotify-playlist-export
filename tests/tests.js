var chai = require('chai')

global.should = chai.should()

describe('Test', function() {

  it('should fail', function() {
    true.should.be.false
  })
})
