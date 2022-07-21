import {Config} from 'lib/types';
import {array as yupArray, bool as yupBool, number as yupNumber, object as yupObject, string as yupString} from 'yup';

const schema = yupObject({
  void: yupObject({
    useHttps: yupBool().default(false),
    host: yupString().default('0.0.0.0'),
    port: yupNumber().default(3000),
    secret: yupString().test('secretCheck', 'void.secret must be either empty or at least 32 characters', t => t.length === 0 || t.length >= 32),
    rateLimit: yupNumber().min(1000),
    databaseUrl: yupString().default('postgres://postgres:postgres@postgres/postgres'),
    defaultDomain: yupString().required(),
    discordProvider: yupObject({
      clientId: yupString().required(),
      clientSecret: yupString().required()
    }).nullable(),
    url: yupObject({
      allowVanityUrl: yupBool().default(false),
      length: yupNumber().min(3).default(6)
    }),
    upload: yupObject({
      outputDirectory: yupString().default('./uploads'),
      blacklistedExtensions: yupArray().default([])
    })
  }).required(),
  neutron: yupObject({
    enabled: yupBool().default(false),
    token: yupString().nullable(),
    clientId: yupString().nullable(),
    guildId: yupString().nullable(),
    logChannel: yupString().nullable()
  }).notRequired()
});

export default async function validate(config): Promise<Config> {
  try {
    return (await schema.validate(config, { abortEarly: false, strict: true })) as Config;
  } catch (e) {
    throw `${e.errors.length} error${e.errors.length > 1 ? 's' : ''} occurred\n${e.errors.map(x => '\t' + x).join('\n')}`;
  }
}
