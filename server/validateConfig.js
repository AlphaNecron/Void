const yup = require('yup');

const validator = yup.object({
  core: yup.object({
    secure: yup.bool().default(false),
    secret: yup.string().min(8).required(),
    host: yup.string().default('0.0.0.0'),
    port: yup.number().default(3000),
    database_url: yup.string().required(),
  }).required(),
  bot: yup.object({
    enabled: yup.bool().default(false),
    prefix: yup.string().min(1).default('*'),
    token: yup.string(),
    admin: yup.array().default([]),
    log_channel: yup.string()
  }),
  uploader: yup.object({
    length: yup.number().default(6),
    directory: yup.string().required(),
    blacklisted: yup.array().default([]),
  }).required(),
});

module.exports = async config => {
  try {
    return await validator.validate(config, { abortEarly: false });
  } catch (e) {
    throw `${e.errors.length} errors occured\n${e.errors.map(x => '\t' + x).join('\n')}`;
  } 
};