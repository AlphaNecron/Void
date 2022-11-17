import { maxed } from 'lib/permission';
import type { Config } from 'lib/types';
import { array as yupArray, bool as yupBool, number as yupNumber, object as yupObject, string as yupString } from 'yup';

export const colorRegex = /^#([\da-f]{3}|[\da-f]{6})$/i;
const colorValidationMessage = {
  message: 'Invalid color.',
  excludeEmptyString: false
};

const configSchema = yupObject({
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
    clientId: yupString().nullable()
  }).notRequired()
});

export const embedSchema = yupObject({
  enabled: yupBool().required(),
  color: yupString().nullable().default('').matches(colorRegex, colorValidationMessage),
  siteName: yupString().nullable().default(''),
  siteNameUrl: yupString().url('Site name URL must be a valid URL.').nullable().default(''),
  title: yupString().nullable().default(''),
  description: yupString().nullable().default(''),
  author: yupString().nullable().default(''),
  authorUrl: yupString().url('Author URL must be a valid URL.').nullable().default('')
}).nullable();

export const roleSchema = yupObject({
  name: yupString().required(),
  color: yupString().matches(colorRegex, colorValidationMessage).required(),
  permissions: yupNumber().min(0).max(maxed).required(),
  maxFileSize: yupNumber().min(1048576).required(),
  maxFileCount: yupNumber().min(1).required(),
  storageQuota: yupNumber().min(1048576).required(),
  maxRefCodes: yupNumber().min(0).required()
}).required();

export const userSchema = yupObject({
  name: yupString().nullable().min(2, {message: 'Display name should be longer than 2 characters.'}).max(12, 'Display name should not longer than 12 characters.'),
  username: yupString().nullable().matches(/^(\S+)([A-Za-z_]\w*)$/ug, 'Username must be alphanumeric.').min(3, {message: 'Username should be longer than 3 characters.'}),
  password: yupString().nullable().matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{6,}$/g, {
    excludeEmptyString: true,
    message: 'Password must match shown criteria.'
  }),
  embed: embedSchema
});

export async function validateConfig(config): Promise<Config> {
  try {
    return (await configSchema.validate(config, {
      abortEarly: false,
      strict: true,
      stripUnknown: true
    })) as Config;
  } catch (e) {
    throw `${e.errors.length} error${e.errors.length > 1 ? 's' : ''} occurred\n${e.errors.map(x => '\t' + x).join('\n')}`;
  }
}
