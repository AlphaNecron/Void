const {name, version} = require('./package.json');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const config = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    voidVersion: `${name}@${version}`
  }
};

module.exports = withBundleAnalyzer(config);
