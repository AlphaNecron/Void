// import * as yup from 'yup';

// const validator = yup.object({
//   core: yup.object({
//     secure: yup.bool().default(false),
//     secret: yup.string().min(8).required(),
//     host: yup.string().default('0.0.0.0'),
//     port: yup.number().default(3000),
//     database_url: yup.string().required()
//   }).required(),
//   bot: yup.object({
//     enabled: yup.bool().default(false),
//     prefix: yup.string().min(1),
//     token: yup.string(),
//     admins: yup.array().default([]),
//     log_channel: yup.string(),
//     default_uid: yup.number().default(1),
//     hostname: yup.string().default('localhost')
//   }),
//   shortener: yup.object({
//     allow_vanity: yup.bool().default(false),
//     length: yup.number().default(6),
//     route: yup.string().required()
//   }).required(),
//   uploader: yup.object({
//     raw_route: yup.string().required(),
//     length: yup.number().default(6),
//     directory: yup.string().required(),
//     max_size: yup.number().default(104857600),
//     blacklisted: yup.array().default([])
//   }).required(),
// });

export default async function validate(config) {
  return await (async() => true)();
}

// export default async function validate(config) {
//   try {
//     return await validator.validate(config, { abortEarly: false });
//   } catch (e) {
//     throw `${e.errors.length} errors occured\n${e.errors.map(x => '\t' + x).join('\n')}`;
//   } 
// };