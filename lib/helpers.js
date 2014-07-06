module.exports = (function() {

  var store = window.localStorage

  const STORE_KEY = 'spotify-export'

  // From Q: https://github.com/kriskowal/q/blob/v1/q.js#L1140
  Promise.prototype.spread = function(fulfilled, rejected) {
    return this.then(function(values) {
      return fulfilled.apply(void 0, values)
    }, rejected)
  }

  var Helpers = {

    extend: function(obj) {
      [].slice.call(arguments, 1).forEach(function(source) {
        if (source) {
          for (var prop in source) {
            obj[prop] = source[prop]
          }
        }
      })
      return obj
    },

    bindEvents: function(eventMap) {
      var app = this

      Object.keys(eventMap).forEach(function(elementAndEvent) {
        var func = eventMap[elementAndEvent],
            element = elementAndEvent.split(' ')[0],
            evt = elementAndEvent.split(' ')[1]

        if(typeof func === 'string' && typeof app[func] === 'function') {
          func = app[func]
        }

        // Weird workaround
        if(element === 'window') {
          window.addEventListener(evt, func.bind(app), false)
        }
        else {
          $(element).on(evt, func.bind(app))
        }
      })
    },

    calculateExpireDateFromToday: function(offsetInSeconds) {
      var now = new Date(),
          seconds = now.getSeconds()

      now.setSeconds(seconds + offsetInSeconds)
      return now
    },

    flattenArray: function(array) {
      return array.reduce(function(prev, current) {
        return prev.concat(current)
      }, [])
    },

    createPermalink: function(username) {
      location.hash = username
      return location.href
    },

    getUsernameFromURL: function() {
      return location.hash.slice(1) || false
    },

    parseHash: function(url) {
      return url.split("#")[1] || false
    },

    createAuthWindow: function(url, params) {
      var width = 400,
          height = 500
      var left = (screen.width / 2) - (width / 2),
          top = (screen.height / 2) - (height / 2)

      return window.open(
        url + this.toQueryString(params),
        "Spotify",
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no,'+
        'width=' + width + ', height=' + height + ', top=' + top + ', left=' + left)
    },

    Store: {
      get: function() {
        var existing = store.getItem(STORE_KEY)
        return existing ? JSON.parse(existing) : {}
      },
      save: function(obj) {
        var original = JSON.parse(store.getItem(STORE_KEY))
        var s = Helpers.extend({}, original, obj)
        store.setItem(STORE_KEY, JSON.stringify(s))
        return Promise.resolve(obj)
      },

      fetch: function(key) {
        var val = this.get()[key]
        return (val) ? Promise.resolve(val) : Promise.reject('Cannot find "'+key+'" in store!')
      }
    },

    toQueryString: function(params) {
      var parts = []
      for (var i in params) {
        if (params.hasOwnProperty(i)) {
          parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]))
        }
      }
      return '?'+parts.join('&')
    }
  }


  return Helpers
})()
