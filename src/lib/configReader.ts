import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { error, info } from './logger';
import parse from '@iarna/toml/parse-string';

const e = (val, type, fn) => ({ val, type, fn });

const envValues = [
  e('SECURE', 'boolean', (c, v) => c.core.secure = v),
  e('SECRET', 'string', (c, v) => c.core.secret = v),
  e('HOST', 'string', (c, v) => c.core.host = v),
  e('PORT', 'number', (c, v) => c.core.port = v),
  e('DATABASE_URL', 'string', (c, v) => c.core.database_url = v),

  e('UPLOADER_RAW_ROUTE', 'string', (c, v) => c.uploader.raw_route = v),
  e('UPLOADER_LENGTH', 'number', (c, v) => c.uploader.length = v),
  e('UPLOADER_DIRECTORY', 'string', (c, v) => c.uploader.directory = v),
  e('UPLOADER_MAX_SIZE', 'number', (c, v) => c.uploader.max_size = v),
  e('UPLOADER_BLACKLISTED', 'array', (c, v) => v ? c.uploader.blacklisted = v : c.uploader.blacklisted = []),

  e('BOT_ENABLED', 'boolean', (c, v) => c.bot.enabled = v),
  e('BOT_PREFIX', 'string', (c, v) => c.bot.prefix = v),
  e('BOT_TOKEN', 'string', (c, v) => c.bot.token = v),
  e('BOT_ADMINS', 'array', (c, v) => v ? c.bot.admins = v : c.bot.admins = []),
  e('BOT_LOG_CHANNEL', 'string', (c, v) => c.bot.log_channel = v),
  e('BOT_DEFAULT_UID', 'string', (c, v) => c.bot.default_uid = v),
  e('BOT_HOSTNAME', 'string', (c, v) => c.bot.hostname = v),

  e('SHORTENER_ROUTE', 'string', (c, v) => c.shortener.route = v),
  e('SHORTENER_LENGTH', 'number', (c, v) => c.shortener.length = v)
];

export default function readConfig() {
  if (!existsSync(join(process.cwd(), 'config.toml'))) {
    error('CONFIG', 'Config file not found, please create one.');
    return tryReadEnv();
  } else {
    if (process.env.JEST_WORKER_ID) return;
    info('CONFIG', 'Reading config file');
    const str = readFileSync(join(process.cwd(), 'config.toml'), 'utf8');
    const parsed = parse(str);
    return parsed;
  }
};

function tryReadEnv() {
  const config = {
    core: {
      secure: undefined,
      secret: undefined,
      host: undefined,
      port: undefined,
      database_url: undefined,
    },
    uploader: {
      raw_route: undefined,
      length: undefined,
      directory: undefined,
      blacklisted: undefined,
    },
    bot: {
      enabled: undefined,
      prefix: undefined,
      admins: undefined,
      log_channel: undefined,
      default_uid: undefined,
      hostname: undefined
    },
    shortener: {
      route: undefined,
      length: undefined,
    },
  };

  for (let i = 0, L = envValues.length; i !== L; ++i) {
    const envValue = envValues[i];
    let value = process.env[envValue.val] as any;
    if (!value) {
      envValues[i].fn(config, undefined);
    } else {
      envValues[i].fn(config, value);
      if (envValue.type === 'number') value = parseToNumber(value);
      else if (envValue.type === 'boolean') value = parseToBoolean(value);
      else if (envValue.type === 'array') value = parseToArray(value);
      envValues[i].fn(config, value);
    }
  }
  return config;
}

function parseToNumber(value) {
  const number = Number(value);
  if (isNaN(number)) return undefined;
  return number;
}

function parseToBoolean(value) {
  if (!value || value === 'false') return false;
  else return true;
}

function parseToArray(value) {
  return value.split(',');
}