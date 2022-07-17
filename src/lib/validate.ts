import {Config} from 'lib/types';
import * as yup from 'yup';

const schema = yup.object({
  void: yup.object({
    useHttps: yup.bool().default(false),
    host: yup.string().default('0.0.0.0'),
    port: yup.number().default(3000),
    secret: yup.string().test('secretCheck', 'void.secret must be either empty or at least 32 characters', t => t.length === 0 || t.length >= 32),
    rateLimit: yup.number().min(1000),
    databaseUrl: yup.string().default('postgres://postgres:postgres@postgres/postgres'),
    defaultDomain: yup.string().required(),
    discordProvider: yup.object({
      clientId: yup.string().required(),
      clientSecret: yup.string().required()
    }).nullable(),
    url: yup.object({
      allowVanityUrl: yup.boolean().default(false),
      length: yup.number().min(3).default(6)
    }),
    upload: yup.object({
      outputDirectory: yup.string().default('./uploads'),
      blacklistedExtensions: yup.array().default([])
    })
  }).required(),
  neutron: yup.object({
    enabled: yup.bool().default(false),
    token: yup.string().nullable(),
    clientId: yup.string().nullable(),
    guildId: yup.string().nullable()
  }).notRequired()
});

export default async function validate(config): Promise<Config> {
  try {
    return (await schema.validate(config, { abortEarly: false, strict: true })) as Config;
  } catch (e) {
    throw `${e.errors.length} error${e.errors.length > 1 ? 's' : ''} occurred\n${e.errors.map(x => '\t' + x).join('\n')}`;
  }
}
