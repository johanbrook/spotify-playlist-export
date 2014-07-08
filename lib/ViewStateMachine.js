module.exports = (function() {

  var findState = function(curr, events) {
    for(var i = 0; i < events.length; i++) {
      if(events[i].from === curr) return events[i]
    }
  }

  var findNext = function(curr, events) {
    return findState(curr, events).to
  }

  var findEvent = function(event, events) {
    for(var i = 0; i < events.length; i++) {
      if(events[i].name === event) return events[i]
    }
  }

  var createMethod = function(event) {
    var action = event.name

    ViewStateMachine.prototype[action] = function() {
      var movingTo = findEvent(action, this.events).to

      if(this.next() === movingTo) {
        this.advance()
      }

      return this
    }
  }

  function ViewStateMachine(options) {
    this.current = options.initial
    this.events = options.events

    this._listeners = {
      transition: []
    }

    // create dynamic event methods
    this.events.forEach(createMethod.bind(this))
  }

  ViewStateMachine.prototype.advance = function() {
    this.current = this.next()
    this.trigger('transition')
    return this
  }

  ViewStateMachine.prototype.next = function() {
    return findNext(this.current, this.events)
  }

  ViewStateMachine.prototype.allExceptCurrent = function() {
    var results = []
    for(var i = 0; i < this.events.length; i++) {
      var f = this.events[i].from,
          t = this.events[i].to

      if(f !== this.current && results.indexOf(f) === -1) results.push(f)
      if(t !== this.current && results.indexOf(t) === -1) results.push(t)
    }

    return results
  }

  ViewStateMachine.prototype.on = function(event, cb) {
    this._listeners[event].push(cb)
  }

  ViewStateMachine.prototype.trigger = function(name) {
    var args = [].slice.call(arguments)

    this._listeners[name].forEach(function(callback) {
      callback.apply(this, args.slice(1))
    }.bind(this))
  }

  return ViewStateMachine

})()
