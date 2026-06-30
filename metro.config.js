const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable watchman — drops subscriptions with spaces in directory path
// useWatchman lives under config.resolver (confirmed in metro/src/node-haste/DependencyGraph/createFileMap.js)
config.resolver.useWatchman = false;

// Force tabler icons through Babel so private class fields get transpiled
const defaultBlockList = config.resolver.blockList ?? [];
config.resolver.blockList = defaultBlockList;

config.transformer.transformIgnorePatterns = [
  'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tabler/icons-react-native)',
];

module.exports = config;
