const { join } = require('path');
const { info, error } = require('./logger');
const { existsSync, readFileSync } = require('fs');

const e = (val, type, fn, required = true) => ({ val, type, fn, required });

const envValues = [
  e('SECURE', 'boolean', (c, v) => c.core.secure = v),
  e('SECRET', 'string', (c, v) => c.core.secret = v),
  e('HOST', 'string', (c, v) => c.core.host = v),
  e('PORT', 'number', (c, v) => c.core.port = v),
  e('DATABASE_URL', 'string', (c, v) => c.core.database_url = v),
  e('UPLOADER_LENGTH', 'number', (c, v) => c.uploader.length = v),
  e('UPLOADER_DIRECTORY', 'string', (c, v) => c.uploader.directory = v),
  e('UPLOADER_BLACKLISTED', 'array', (c, v) => c.uploader.blacklisted = v),
];

module.exports = () => {
  if (!existsSync(join(process.cwd(), 'config.toml'))) {
    info('CONFIG', 'Reading environment');
    return tryReadEnv();
  } else {
    info('CONFIG', 'Reading config file');
    const str = readFileSync(join(process.cwd(), 'config.toml'), 'utf8');
    const parsed = require('@iarna/toml/parse-string')(str);
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
      length: undefined,
      directory: undefined,
      blacklisted: undefined
    }
  };

  for (let i = 0, L = envValues.length; i !== L; ++i) {
    const envValue = envValues[i];
    let value = process.env[envValue.val];
    if (envValue.required && !value) {
      error('CONFIG', `There is no config file or required environment variables (${envValue.val})... exiting...`);
      process.exit(1);
    }
    envValues[i].fn(config, value);
    if (envValue.type === 'number') value = parseToNumber(value);
    else if (envValue.type === 'boolean') value = parseToBoolean(value);
    else if (envValue.type === 'array') value = parseToArray(value);
    envValues[i].fn(config, value);
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