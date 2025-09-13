const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Simple resolver configuration for web
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
  },
  sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'css', 'mjs'],
  assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'css', 'ttf', 'otf', 'woff', 'woff2'],
  unstable_enablePackageExports: true,
  unstable_conditionNames: ['react-native', 'browser', 'default'],
};

module.exports = config;