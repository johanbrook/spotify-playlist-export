module.exports = (function() {
  var Handlebars = require('handlebars')

  function ensureTwoDigits(number) {
    var s = new String(number)
    return s.length < 2 ? "0"+s : s
  }

  Handlebars.registerHelper('artists', function() {
    return this.artists.map(function(a) { return a.name }).join(', ')
  })

  Handlebars.registerHelper('durationInMinutes', function(ms) {
    var seconds = ms / 1000
    return ~~(seconds / 60) + ":" + ensureTwoDigits(Math.round(seconds % 60))
  })
})()
