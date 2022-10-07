const Joi = require('joi');

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required(),
});

const PlaylistIdSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PlaylistPayloadSchema,
  PlaylistIdSongPayloadSchema,
};
