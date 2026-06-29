const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['@react-navigation'],
      },
    },
    argv
  );

  // Customize the config before returning it
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native': 'react-native-web',
  };

  // Support platform-specific file extensions with proper resolution order
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.js',
    '.tsx',
    '.ts',
    '.js',
    '.jsx',
    '.json',
  ];

  // Configure output for optimized bundles
  if (argv.mode === 'production') {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      runtimeChunk: 'single',
    };
  }

  return config;
};
