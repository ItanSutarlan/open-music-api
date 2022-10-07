const autoBind = require('auto-bind');

class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const message = {
      playlistId: id,
      targetEmail: request.payload.targetEmail,
    };

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._producerService.sendMessage('export:songs', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrian',
    }).code(201);
  }
}

module.exports = ExportsHandler;
