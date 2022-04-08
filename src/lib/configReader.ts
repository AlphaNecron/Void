import {existsSync, readFileSync} from 'fs';
import {join} from 'path';
import {error, info} from './logger';

export default function readConfig() {
  if (!existsSync(join(process.cwd(), 'config.json'))) {
    return error('CONFIG', 'Config file not found, please create one.');
  } else {
    info('CONFIG', 'Reading config file');
    const str = readFileSync(join(process.cwd(), 'config.json'), 'utf8');
    return JSON.parse(str);
  }
};
