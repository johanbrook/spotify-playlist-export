# Spotify Playlist Export

Export track info from your Spotify playlists.

## Features

- [x] User should be able to view their playlists
  - [ ] User should be able to view playlist metadata
- [ ] User should be able to choose if to fetch only their own playlists
- [x] User should be able to re-visit the state from an URL
- [ ] User should be able to export a playlist to:
  - [x] JSON
  - [ ] CSV
  - [ ] Print
- [x] User should be able to choose which playlists to export
  - [ ] User should be able to toggle all or none
- [ ] User should be able to print export from the app

## Develop

```bash
npm install
gulp watch
open http://localhost:3000
```
or
```bash
npm install
./hack.sh
```

## Significant tech

- Browserify
- Handlebars
- ES6 Promises
- gulp

## Author

[Johan Brook](http://github.com/johanbrook), 2014.

## License

[MIT](https://github.com/johanbrook/spotify-playlist-export/blob/master/LICENSE)
