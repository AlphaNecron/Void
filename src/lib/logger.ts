import colors, {blue} from '@colors/colors';
import {DateTime} from 'luxon';
import type {Logger, QueryOptions} from 'winston';

colors.setTheme({
  info: 'green',
  debug: 'blue',
  warn: 'yellow',
  error: 'red'
});

export const queryLog = (options?: QueryOptions) => new Promise<{
  file: {
    timestamp: string,
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string
  }[]}>((resolve ,reject) => {
    global.logger.query(options || {
      from: new Date(new Date().valueOf() - 60*60*24*1000),
      until: new Date(),
      limit: 100,
      start: 0,
      order: 'desc' as 'desc' | 'asc',
      fields: ['level', 'timestamp', 'message']
    }, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const log = (level, msg) => {
  const date = DateTime.now().toFormat('D - TT');
  console.log(`[${blue(date)}] ${colors[level](level)}: ${msg}`);
};

// fallback logger
export const fallback = {
  info: msg => log('info', msg),
  debug: msg => log('debug', msg),
  warn: msg => log('warn', msg),
  error: msg => log('error', msg)
};

export default global.logger as Logger;
