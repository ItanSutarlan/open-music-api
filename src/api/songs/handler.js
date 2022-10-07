const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(req, h) {
    this._validator.validateMusicPayload(req.payload);
    const songId = await this._service.addSong(req.payload);

    return h.response({
      status: 'success',
      data: {
        songId,
      },
    }).code(201);
  }

  async getSongsHandler(req) {
    const songs = await this._service.getSongs(req.query);
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(req) {
    const { id } = req.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(req) {
    this._validator.validateMusicPayload(req.payload);

    const { id } = req.params;

    await this._service.editSongById(id, req.payload);
    return {
      status: 'success',
      message: 'Music berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(req) {
    const { id } = req.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Music berhasil dihapus',
    };
  }
}

module.exports = SongsHandler;
