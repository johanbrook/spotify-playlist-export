module.exports = (function() {

  var Handlebars = require('handlebars'),
      Highlight = require('highlight.js')

  Handlebars.registerPartial('playlistItem', $('#playlist-item').html())

  var templates = {
    playlists: Handlebars.compile($("#playlists").html())
  }

  return {
    renderPlaylists: function(playlists) {
      var html = templates.playlists({ playlists: playlists })
      $("#select-playlists").html(html)
    },

    renderResult: function(json) {
      var result = Highlight.highlightAuto( JSON.stringify(json, null, 2), ['json'])
      $("#results").html(result.value)
    }
  }

})()
