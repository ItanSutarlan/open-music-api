const autoBind = require('auto-bind');

class AlbumsHandler {
  constructor(albumsService, storageService, validator) {
    this._albumsService = albumsService;
    this._storageService = storageService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);

    const albumId = await this._albumsService.addAlbum(request.payload);
    return h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postCoverToAlbumHandler(request, h) {
    const { cover } = request.payload;
    this._validator.validateAlbumCoverHeaders(cover.hapi.headers);

    const { id } = request.params;

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    const url = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.addAlbumCover(id, url);

    return h.response({
      status: 'success',
      message: 'Cover sukses ditambahkan',
    }).code(201);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._albumsService.checkAlbumAvailabilityById(albumId);
    await this._albumsService.addLikeOrDislikeToAlbum(albumId, credentialId);

    return h.response({
      status: 'success',
      message: 'Berhasil menambahkan like',
    }).code(201);
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { cache, likes } = await this._albumsService.getLikeCounts(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    if (cache) response.header('X-Data-Source', 'cache');
    return response;
  }
}

module.exports = AlbumsHandler;
