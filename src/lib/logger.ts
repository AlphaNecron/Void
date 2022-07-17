import {format} from 'fecha';
import {blue, bold, gray, green, magenta, red, underline, yellow} from 'picocolors';
import {fallbackSymbols, mainSymbols} from './constants';
import {getStacktrace, isUnicodeSupported} from './serverUtils';

type Level = 'success' | 'info' | 'error' | 'warn' | 'debug';

class Logger {
  protected readonly _prefix: string;
  private readonly _useFallback = !isUnicodeSupported();
  
  constructor(prefix = 'Void') {
    this._prefix = prefix;
  }
  
  colorize = (level: Level): string =>
    (level === 'success' ? green
      : level === 'warn' ? yellow
        : level === 'error' ? red
          : level === 'debug' ? magenta
            : blue)(bold(underline(`${this.getSymbol(level)} ${level}`)));
  getSymbol = (key: (keyof typeof mainSymbols) | Level) => this._useFallback ? fallbackSymbols[key] || mainSymbols[key] : mainSymbols[key];
  info = (msg: string, prefix = this._prefix) => this.log(prefix, 'info', msg);
  debug = (msg: string, prefix = this._prefix) => this.log(prefix, 'debug', msg);
  warn = (msg: string, prefix = this._prefix) => this.log(prefix, 'warn', msg);
  error(err: string | Error, prefix = this._prefix) {
    if (err instanceof String)
      return this.log(prefix, 'error', err as string);
    const e = err as Error;
    this.log(prefix, 'error', e.message);
    console.log(gray(getStacktrace(e)));
  }
  
  private log(prefix: string, level: Level, msg: string) {
    const date = format(new Date(), 'mediumTime');
    console.log(`${gray(`[${date}] ${prefix} ${this.getSymbol('pointer')}`)}\t${this.colorize(level)} ${msg}`);
  }
}

if (!global.logger) global.logger = new Logger();

export default global.logger as Logger;
