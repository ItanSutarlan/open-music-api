const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  fullname: Joi.string()
    .min(3)
    .max(100)
    .required(),
});

module.exports = { UserPayloadSchema };
