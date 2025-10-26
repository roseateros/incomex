module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@services': './src/services',
            '@providers': './src/providers',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@config': './src/config',
            '@models': './src/models',
            '@constants': './src/constants'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ]
  };
};
