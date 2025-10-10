const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'mjs', 'cjs'],
    assetExts: [...defaultConfig.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif'],
    platforms: ['ios', 'android', 'web'],
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      'react-native': 'react-native-web',
      '@supabase/node-fetch': require.resolve('node-fetch'),
      'node-fetch': require.resolve('node-fetch'),
      'cross-fetch': require.resolve('node-fetch'),
      'fetch': require.resolve('node-fetch'),
    },
  },
  transformer: {
    ...defaultConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};