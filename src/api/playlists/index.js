const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    playlistSongsService,
    playlistActivitiesService,
    musicService,
    validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      playlistSongsService,
      playlistActivitiesService,
      musicService,
      validator,
    );
    server.route(routes(playlistsHandler));
  },
};
