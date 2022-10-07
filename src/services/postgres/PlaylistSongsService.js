const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongsService {
  constructor(playlistsService) {
    this._pool = new Pool();
    this._playlistsService = playlistsService;
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = nanoid(16);
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Song gagal ditambahkan');
    }
  }

  async getSongsFromPlaylist(playlistId) {
    const playlist = await this._playlistsService.getPlaylistById(playlistId);

    const query = {
      text: `SELECT music.id, music.title, music.performer FROM playlist_songs
      INNER JOIN music ON music.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const { rows } = await this._pool.query(query);
    playlist.songs = rows;
    return playlist;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Song gagal dihapus');
    }
  }
}

module.exports = PlaylistSongsService;
