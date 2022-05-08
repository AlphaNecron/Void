import {Config} from 'lib/types';
import * as yup from 'yup';

const schema = yup.object({
  void: yup.object({
    useHttps: yup.bool().default(false),
    host: yup.string().default('0.0.0.0'),
    port: yup.number().default(3000),
    databaseUrl: yup.string().default('postgres://postgres:postgres@postgres/postgres'),
    defaultDomain: yup.string().required(),
    url: yup.object({
      allowVanityUrl: yup.boolean().default(false),
      length: yup.number().min(3).default(6)
    }),
    upload: yup.object({
      outputDirectory: yup.string().default('./uploads'),
      blacklistedExtensions: yup.array().default([])
    })
  }).required(),
});

export default async function validate(config): Promise<Config> {
  try {
    return (await schema.validate(config, { abortEarly: false, strict: true })) as Config;
  } catch (e) {
    throw `${e.errors.length} error${e.errors.length > 1 ? 's' : ''} occured\n${e.errors.map(x => '\t' + x).join('\n')}`;
  }
}
