const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class PlaylistActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivityToPlaylistActivities({
    playlistId, songId, userId, action,
  }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5)',
      values: [id, playlistId, songId, userId, action],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Activity gagal ditambahkan');
    }
  }

  async getPlaylistActivitiesByPlaylistId(playlistId) {
    const query = {
      text: `SELECT users.username, music.title, playlist_activities.action, playlist_activities.time FROM playlist_activities
      INNER JOIN users ON playlist_activities.user_id = users.id
      INNER JOIN music ON playlist_activities.music_id = music.id
      WHERE playlist_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Music tidak ditemukan');
    }

    return result.rows;
  }
}

module.exports = PlaylistActivitiesService;
