module.exports = (function() {

  var Handlebars = require('handlebars')

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
      var result = JSON.stringify(json, null, 2)
      $("#results").html(result)
    }
  }

})()
