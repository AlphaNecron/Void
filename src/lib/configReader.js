const { join } = require('path');
const { info, error } = require('./logger');
const { existsSync, readFileSync } = require('fs');

module.exports = () => {
  if (!existsSync(join(process.cwd(), 'config.toml'))) {
    error('CONFIG', 'Config file not found, please create one.');
    process.exit(1);
  } else {
    info('CONFIG', 'Reading config file');
    const str = readFileSync(join(process.cwd(), 'config.toml'), 'utf8');
    const parsed = require('@iarna/toml/parse-string')(str);
    return parsed;
  }
};