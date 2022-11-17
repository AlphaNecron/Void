import TTLCache from '@isaacs/ttlcache';
import { format } from 'fecha';
import { createWriteStream, mkdirSync, WriteStream } from 'fs';
import type { LogEntry, LogLevel } from 'lib/types';
import { EOL } from 'os';
import { resolve } from 'path';
import { blue, bold, gray, green, magenta, red, underline, yellow } from 'picocolors';
import { fallbackSymbols, mainSymbols } from './constants';
import { getStacktrace, isUnicodeSupported } from 'void/utils';

export class Logger {
  private readonly _defaultPrefix: string;
  private readonly _useFallback: boolean;
  private readonly _verbose: boolean;
  private readonly _logCache: TTLCache<number, LogEntry>;
  private readonly _logWriter: WriteStream;

  constructor(defaultPrefix = 'Void') {
    this._logCache = new TTLCache({
      max: 50,
      ttl: 1 << 24,
      noUpdateTTL: true
    });
    this._defaultPrefix = defaultPrefix;
    this._useFallback = !isUnicodeSupported();
    mkdirSync('logs', {recursive: true});
    this._logWriter = createWriteStream(resolve('logs', `void_${format(new Date(), 'YYYY_MM_dd_HH_mm_ss')}.log`), {flags: 'wx'});
    process.once('exit', () => this._logWriter.close());
    this._verbose = process.env.NODE_ENV === 'development' || process.env.VERBOSE === 'true';
  }

  public query(count = 25): LogEntry[] {
    const entries: LogEntry[] = [];
    for (const [i, entry] of this._logCache.entries()) {
      entries.push(entry);
      if (i >= count) break;
    }
    return entries;
  }

  save(message: string, level: LogLevel, prefix) {
    if (level === 'debug') return;
    const date = new Date();
    const entry: Partial<LogEntry> = {
      prefix,
      level,
      message
    };
    this._logWriter.write(JSON.stringify({
      ...entry,
      timestamp: date
    }) + EOL);
    this._logCache.set(this._logCache.size, {
      ...entry,
      timestamp: format(date, 'HH:mm:ss DD/MM/YYYY')
    } as LogEntry);
  }

  colorize = (level: LogLevel): string =>
    (level === 'success' ? green
      : level === 'warn' ? yellow
        : level === 'error' ? red
          : level === 'debug' ? magenta
            : blue)(bold(underline(`${this.getSymbol(level)} ${level}`)));
  getSymbol = (key: (keyof typeof mainSymbols) | LogLevel) => this._useFallback ? fallbackSymbols[key] || mainSymbols[key] : mainSymbols[key];
  info = (msg: string, prefix = this._defaultPrefix) => this.log(prefix, 'info', msg);
  debug = (msg: string, prefix = this._defaultPrefix) => this.log(prefix, 'debug', msg);
  warn = (msg: string, prefix = this._defaultPrefix) => this.log(prefix, 'warn', msg);

  error(err: string | Error, prefix = this._defaultPrefix) {
    if (err instanceof String)
      return this.log(prefix, 'error', err as string);
    const e = err as Error;
    this.log(prefix, 'error', e.message || e.name);
    if (this._verbose)
      console.error(gray(getStacktrace(e)));
  }

  private log(prefix: string, level: LogLevel, msg: string) {
    const date = format(new Date(), 'mediumTime');
    console[level === 'error' ? 'error' : 'log'](`${gray(`[${date}] ${prefix} ${this.getSymbol('pointer')}`)}\t${this.colorize(level)} ${msg}`);
    this.save(msg, level, prefix);
  }
}
