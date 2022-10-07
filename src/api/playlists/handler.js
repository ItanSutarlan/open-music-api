const autoBind = require('auto-bind');

class PlaylistsHandler {
  // eslint-disable-next-line max-len
  constructor(playlistsService, playlistSongsService, playlistActivitiesService, musicService, validator) {
    this._playlistsService = playlistsService;
    this._playlistSongsService = playlistSongsService;
    this._playlistActivitiesService = playlistActivitiesService;
    this._musicService = musicService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._playlistsService.addPlaylist(name, credentialId);

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    }).code(201);
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongToPlaylistByIdHandler(request, h) {
    this._validator.validatePlaylistIdSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._musicService.checkSongAvailabilityById(songId);
    await this._playlistSongsService.addSongToPlaylist(playlistId, songId);
    await this._playlistActivitiesService
      .addActivityToPlaylistActivities({
        playlistId,
        songId,
        userId: credentialId,
        action: 'add',
      });

    return h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
    }).code(201);
  }

  async getSongsFromPlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    const playlist = await this._playlistSongsService.getSongsFromPlaylist(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlist,
      },
    };
  }

  async deleteSongFromPlaylistByIdHandler(request) {
    this._validator.validatePlaylistIdSongPayload(request.payload);
    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._musicService.checkSongAvailabilityById(songId);
    await this._playlistSongsService.deleteSongFromPlaylist(playlistId, songId);
    await this._playlistActivitiesService
      .addActivityToPlaylistActivities({
        playlistId,
        songId,
        userId: credentialId,
        action: 'delete',
      });

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const activities = await this._playlistActivitiesService
      .getPlaylistActivitiesByPlaylistId(playlistId);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = PlaylistsHandler;
