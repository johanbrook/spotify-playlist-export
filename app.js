window.App = (function() {

  'use strict'

  var Helpers = require('./lib/helpers'),
      P = require('./lib/p'),
      SpotifyWebApi = require('./lib/spotify'),
      View = require('./lib/view'),

      api = new SpotifyWebApi()

  var auth_url = "https://accounts.spotify.com/authorize",
      auth_window = null,

  auth_params = {
    client_id: "207e77ee827645b48fea436c506d7c8d",
    redirect_uri: "http://localhost:3000/callback.html",
    scope: "playlist-read playlist-read-private",
    response_type: "token"
  }

  return {

    initialize: function() {
      this.checkAuth().catch(function(err) {
        console.info(err)
      })

      this.preFillUsername()

      window.addEventListener('hashchange', function(evt) {
        this.preFillUsername(Helpers.parseHash(evt.newURL))
      }.bind(this))

      window.addEventListener('message', this.onAuthReceived.bind(this))

      $(".btn-login").on('click', this.login.bind(this))
      $("#export").on('click', this.export.bind(this))

      $("#userform").on('submit', function(evt) {
        evt.preventDefault()

        var username = $(evt.target).find("#username").val()

        this.setUsername(username)
        .then(this.fetchPlaylists.bind(this))
        .then(View.renderPlaylists.bind(View))
        .catch(function(err) {
          console.error(err)
        })

      }.bind(this))
    },

    checkAuth: function() {
      return this.getAccessToken().then(this.auth.bind(this), function() {
        throw 'No saved token'
      })
    },

    export: function(evt) {
      var playlistsPromises = this.selectedPlaylists().map(this.fetchPlaylist.bind(this))

      Promise.all(playlistsPromises)
        .then(Helpers.flattenArray)
        .then(View.renderResult)
    },

    selectedPlaylists: function() {
      return $("#select-playlists li")
        .filter(function() {
          return $(this).find("input").is(":checked")
        })
        .map(function() {
          return $(this).data('id')
        })
        .toArray()
    },

    exportMethod: function() {
      $("input[name='format']").filter(function() {
        return $(this).is(":checked")
      }).val()
    },

    setUsername: function(name) {
      return (name) ?
        Helpers.Store.save({ username: name }).then(function(obj) {
          this.username = name
          Helpers.createPermalink(name)
          return name
        }.bind(this)) :
        Promise.reject('Name cannot be empty')
    },

    getUsername: function() {
      if(!this.username) {
        return Helpers.Store.fetch('username')
      }

      return Promise.resolve(this.username)
    },

    login: function(evt) {
      evt.preventDefault()
      auth_window = Helpers.createAuthWindow(auth_url, auth_params)
    },

    onAuthReceived: function(evt) {
      if(evt.origin !== 'http://localhost:3000') return
      auth_window && auth_window.close()

      this.auth(evt.data).then(this.persistAccessToken)
    },

    auth: function(token) {
      console.info("Authed!")
      api.setAccessToken(token)
      return Promise.resolve(token)
    },

    preFillUsername: function(username) {
      $("#username").val( username ? username : (Helpers.getUsernameFromURL() || '') )
    },

    getAccessToken: function() {
      return Helpers.Store.fetch('access_token')
    },

    persistAccessToken: function(token) {
      return Helpers.Store.save({access_token: token})
    },

    fetchPlaylists: function(user) {
      return api.getUserPlaylists(user).then(P.data('items'))
    },

    fetchPlaylist: function(playlistId) {
      return this.getUsername()
      .then(function(username) {
        return api.getPlaylist(username, playlistId)
      })
    }
  }

})()
