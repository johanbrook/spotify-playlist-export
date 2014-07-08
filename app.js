window.App = (function() {

  'use strict'

  var Helpers = require('./lib/helpers'),
      P = require('./lib/p'),
      SpotifyWebApi = require('./lib/spotify'),

      View = require('./lib/view'),
      ViewStateMachine = require('./lib/ViewStateMachine'),

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

    Views: {
      Playlists: new View({
        el: '#select-playlists',
        template: '#playlists-template',
        initialize: function(Handlebars) {
          Handlebars.registerPartial('playlistItem', $('#playlist-item').html())
        }
      }),

      Results: new View({
        el: '#results'
      })
    },

    events: {
      'message window' : 'onAuthReceived',
      'click .btn-login': 'login',
      'click #export' : 'export',
      'submit #userform' : 'foo',
      'hashchange window' : function(evt) {
        this.preFillUsername(Helpers.parseHash(evt.newURL))
      },
      'input #username' : function(evt) {
        $("#fetch").attr('disabled', !$(evt.target).val())
      },
      'click .playlists input[type="radio"]': function(evt) {
        $("#export").attr('disabled', !$('.playlists input:checked').length)
      }
    },

    initialize: function() {
      Helpers.bindEvents.call(this, this.events)

      this.machine = new ViewStateMachine({
        initial: '.auth',
        events: [
          { name: 'chooseAccount', from: '.auth', to: '.account' },
          { name: 'selectPlaylists', from: '.account', to: '.select-playlists' },
          { name: 'showResults', from: '.select-playlists', to: '.results' }
        ]
      })

      var whenAuthed = this.checkAuth().then(function(token) {
        this.auth(token)
      }.bind(this),
      function(msg) {
        console.info(msg +" Please re-auth.")
      })

      whenAuthed.then(function() {
        return this.preFillUsername()
      }.bind(this))
      .then(this.fetchAndRenderPlaylists.bind(this))
      .then(function() {
        $("#fetch").attr('disabled', false)
      })
    },

    fetchAndRenderPlaylists: function(user) {
      return this.fetchPlaylists(user)
        .then(function(playlists) {
          return this.Views.Playlists.render({playlists: playlists})
        }.bind(this))
        .catch(function(err) {
          console.error(err)
        })
    },

    foo: function(evt) {
      evt.preventDefault()

      var username = $(evt.target).find("#username").val()

      this.setUsername(username)
      .then(this.fetchAndRenderPlaylists.bind(this))
    },

    checkAuth: function() {
      var access = this.getAccessToken(),
          expires = this.getExpireDate()

      return Promise.all([access, expires]).spread(function(token, expireDate) {
        if(expireDate < new Date()) {
          // #disable ui
          return Promise.reject('Access token expired. Get a new one!')
        }
        return Promise.resolve(token)

      }.bind(this))
    },

    export: function(evt) {
      var playlistsPromises = this.selectedPlaylists().map(this.fetchPlaylist.bind(this))

      Promise.all(playlistsPromises)
        .then(Helpers.flattenArray)
        .then(function(json) {
          this.Views.Results.customRender(function() {
            return JSON.stringify(json, null, 2)
          })
        }.bind(this))
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

      this.auth(evt.data.token)
      this.persistAccessToken(evt.data.token, evt.data.expires)
    },

    auth: function(token) {
      console.info("Authed! With token: " + token)
      api.setAccessToken(token)
      return Promise.resolve(token)
    },

    preFillUsername: function(username) {
      var name = username ? username : (Helpers.getUsernameFromURL() || '')

      if(name) {
        $("#username").val(name)
        return Promise.resolve(name)
      }

      return Promise.reject('Name cannot be empty')
    },

    getAccessToken: function() {
      return Helpers.Store.fetch('access_token')
    },

    getExpireDate: function() {
      return Helpers.Store.fetch('expires')
    },

    persistAccessToken: function(token, expiresIn) {
      return Helpers.Store.save({
        access_token: token,
        expires: Helpers.calculateExpireDateFromToday(expiresIn).getTime()
      })
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
