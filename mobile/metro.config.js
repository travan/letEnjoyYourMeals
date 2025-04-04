const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom configuration
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@shared': path.resolve(__dirname, '../shared'),
};

// Add extraNodeModules to include shared directory
config.watchFolders = [
  path.resolve(__dirname, '../shared')
];

module.exports = withNativeWind(config, { input: './app/global.css' });