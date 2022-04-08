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
export function logEvent(event: 'upload' | 'shorten' | 'new_user' | 'user_delete' | 'user_update' | 'token_regenerate', data) {
  info(event, data);
}
function log(color: string, type: string, msg) {
  console.log(`${colors.magenta}${colors.black} ${(new Date()).toLocaleTimeString()} ${color} ${type} ${colors.reset} ${msg}`);
}
export function debug(type, msg) {
  log(colors.blue, type, msg);
};
export function warn(type, msg) {
  log(colors.yellow, type, msg);
};
export function error(type, msg) {
  log(colors.red, type, msg);
};
export function info(type, msg) {
  log(colors.cyan, type, msg);
};
