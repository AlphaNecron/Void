const colors = {
  red: '\x1b[41m',
  green: '\x1b[42m',
  yellow: '\x1b[43m',
  blue: '\x1b[44m',
  magenta: '\x1b[45m',
  cyan: '\x1b[46m',
  reset: '\x1b[0m',
  black: '\x1b[30m'
};

enum Severity { Debug = 'DEBUG', Warn = 'WARN', Error = 'ERR', Info = 'INFO' };

function log(color: string, type: string, msg, srv = '') {
  console.log(`${colors.blue}${colors.black} ${(new Date()).toLocaleTimeString()} ${color} ${srv}/${type} ${colors.reset} ${msg}`);
}

export function debug(type, msg) {
  log(colors.magenta, type, msg, Severity.Debug);
};
export function warn(type, msg) {
  log(colors.yellow, type, msg, Severity.Warn);
};
export function error(type, msg) {
  log(colors.red, type, msg, Severity.Error);
};
export function info(type, msg) {
  log(colors.cyan, type, msg, Severity.Info);
};
