const {name, version} = require('./package.json');

const config = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    voidVersion: `${name}@${version}`
  }
};

module.exports = config;
