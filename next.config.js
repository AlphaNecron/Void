const {name, version} = require('./package.json');

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    voidVersion: `${name}@${version}`
  }
};
