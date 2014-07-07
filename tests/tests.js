var chai = require('chai')
chai.should()

var ViewStateMachine = require('../lib/ViewStateMachine')

describe('ViewStateMachine', function() {

  beforeEach(function() {
    this.m = new ViewStateMachine({
      initial: 'state0',
      events: [
        { name: 'warn', from: 'state0', to: 'state1' },
        { name: 'danger', from: 'state1', to: 'state2' },
        { name: 'reset', from: 'state2', to: 'state0' }
      ]
    })
  })

  describe('current state', function() {

    it('should have a current (initial) state', function() {
      this.m.current.should.equal('state0')
    })
  })

  describe('advance', function() {

    it('should advance to the next state', function() {
      this.m.advance()
      this.m.current.should.equal('state1')
    })

  })

  describe('next', function() {

    it('should be able to tell the next state', function() {
      this.m.next().should.equal('state1')
      this.m.advance()
      this.m.next().should.equal('state2')
    })

  })

  describe('transitions', function() {

    it('should trigger events on transitions', function(done) {
      var listener = function() { done() }

      this.m.on('transition', listener)
      this.m.advance()
    })
  })

  describe('allExceptCurrent', function() {

    it('should return all states except current', function() {
      this.m.allExceptCurrent().should.eql(['state1', 'state2'])
      this.m.advance().allExceptCurrent().should.eql(['state0', 'state2'])
    })
  })


  it('should be able to trigger events', function() {
    this.m.warn()
    this.m.current.should.equal('state1')
    this.m.danger()
    this.m.current.should.equal('state2')
    this.m.reset()
    this.m.current.should.equal('state0')
  })


})
