(function() {

  var StateMachine = (function() {

    var findState = function(curr, events) {
      for(var i = 0; i < events.length; i++) {
        if(events[i].from === curr) return events[i]
      }
    }

    var findNext = function(curr, events) {
      var state = findState(curr, events)

      return (state) ? state.to : null
    }

    var findEvent = function(event, events) {
      for(var i = 0; i < events.length; i++) {
        if(events[i].name === event) return events[i]
      }
    }

    var createMethod = function(event) {
      var action = event.name

      Constructor.prototype[action] = function() {
        var movingTo = findEvent(action, this.events).to

        if(this.next() === movingTo) {
          this.advance()
        }

        return this
      }
    }

    function Constructor(options) {
      this.current = options.initial
      this.events = options.events

      this._listeners = {
        transition: []
      }

      // create dynamic event methods
      this.events.forEach(createMethod.bind(this))
    }

    Constructor.prototype.advance = function() {
      this.current = this.next()
      this.trigger('transition', this.next())
      return this
    }

    Constructor.prototype.next = function() {
      return findNext(this.current, this.events)
    }

    Constructor.prototype.allExceptCurrent = function() {
      var results = []
      for(var i = 0; i < this.events.length; i++) {
        var f = this.events[i].from,
            t = this.events[i].to

        if(f !== this.current && results.indexOf(f) === -1) results.push(f)
        if(t !== this.current && results.indexOf(t) === -1) results.push(t)
      }

      return results
    }

    Constructor.prototype.on = function(event, cb) {
      this._listeners[event].push(cb)
    }

    Constructor.prototype.trigger = function(name) {
      var args = [].slice.call(arguments)

      this._listeners[name].forEach(function(callback) {
        callback.apply(this, args.slice(1))
      }.bind(this))
    }

    return Constructor
  })()

  var ViewStateMachine = (function() {

    function Constructor(options) {
      // Call super
      StateMachine.call(this, options)

      this.hiddenClass = options.hiddenClass || 'hide'

      this.on('transition', function(next) {
        console.log("Transition", this.current)
        this.showView(this.current)
      })

      this.allExceptCurrent().map(this.hideView.bind(this))
    }

    // Inherit
    Constructor.prototype = Object.create(StateMachine.prototype)
    Constructor.prototype.constructor = Constructor

    Constructor.prototype.hideView = function(view) {
      $(view).addClass(this.hiddenClass)
      return this
    };

    Constructor.prototype.showView = function(view) {
      $(view).removeClass(this.hiddenClass)
      return this
    };

    return Constructor

  })()

  module.exports = {
    StateMachine: StateMachine,
    ViewStateMachine: ViewStateMachine
  }

})()
