const { error } = require('../src/lib/logger');

function dot(str, obj) {
  return str.split('.').reduce((a,b) => a[b], obj);
}

const path = (path, type) => ({ path, type });

module.exports = async config => {
  const paths = [
    path('core.secure', 'boolean'),
    path('core.secret', 'string'),
    path('core.host', 'string'),
    path('core.port', 'number'),
    path('core.database_url', 'string'),
    path('uploader.length', 'number'),
    path('uploader.directory', 'string'),
    path('uploader.blacklisted', 'object'),
  ];
  
  let errors = 0;
  for (let i = 0, L = paths.length; i !== L; ++i) {
    const path = paths[i];
    const value = dot(path.path, config);
    if (value === undefined) {
      error('CONFIG', `There was no ${path.path} in config which was required`);
      ++errors;
    }
    const type = typeof value;
    if (value !== undefined && type !== path.type) {
      error('CONFIG', `Expected ${path.type} on ${path.path}, but got ${type}`);
      ++errors;
    }
  }
  if (errors !== 0) {
    error('CONFIG', `Exiting due to ${errors} errors`);
    process.exit(1);
  }  
};