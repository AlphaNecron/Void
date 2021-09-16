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

function log(color, stype, msg, srv) {
  console.log(`${colors.blue}${colors.black} ${(new Date()).toLocaleTimeString()} ${color} ${srv}/${stype} ${colors.reset} ${msg}`);
}

module.exports = {
  debug: function(stype, msg) {
    log(colors.magenta, stype, msg, 'DBUG');
  },
  warn: function(stype, msg) {
    log(colors.yellow, stype, msg, 'WARN');
  },
  error: function(stype, msg) {
    log(colors.red, stype, msg, 'ERR');
  },
  info: function(stype, msg) {
    log(colors.cyan, stype, msg, 'INFO');
  },
};
