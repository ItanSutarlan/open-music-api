const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumToModel } = require('../../utils');

class AlbumsService {
  constructor(musicService, cacheService) {
    this._pool = new Pool();
    this._musicService = musicService;
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const albumResult = await this._pool.query(albumQuery);

    if (!albumResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const musicResult = await this._musicService.getSongsByAlbumId(id);
    return {
      ...albumResult.rows.map(mapAlbumToModel)[0],
      songs: musicResult,
    };
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async addAlbumCover(id, url) {
    const query = {
      text: 'UPDATE albums SET cover_url = $1 WHERE id = $2',
      values: [url, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menambahkan cover. Id tidak ditemukan');
    }
  }

  async addLikeOrDislikeToAlbum(albumId, userId) {
    const result = await this._pool.query({
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    });

    if (!result.rowCount) {
      const id = nanoid(16);
      await this._pool.query({
        text: 'INSERT INTO user_album_likes VALUES($1, $2, $3)',
        values: [id, userId, albumId],
      });
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikeCounts(albumId) {
    try {
      const rowCount = await this._cacheService.get(`likes:${albumId}`);
      return {
        cache: 'cache',
        likes: JSON.parse(rowCount),
      };
    } catch (error) {
      const query = {
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const { rowCount } = await this._pool.query(query);

      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(rowCount));

      return { likes: rowCount };
    }
  }

  async checkAlbumAvailabilityById(id) {
    const query = {
      text: 'SELECT id FROM albums WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = AlbumsService;
