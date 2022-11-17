const {name, version} = require('./package.json');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

/**
 * @type {Partial<import('next').NextConfig>}
 */
const config = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    void: `${name}@${version}`
  }
};

module.exports = withBundleAnalyzer(config);
