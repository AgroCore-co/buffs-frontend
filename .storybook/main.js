const path = require('path');
const webpack = require('webpack');

/** @type { import('@storybook/react-webpack5').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      'next/link': path.resolve(__dirname, './nextLinkMock.js'),
    };

    // Remove regras CSS padrão do Storybook
    config.module.rules = config.module.rules.filter(
      (rule) => rule.test && !rule.test.toString().includes('css')
    );

    // Adiciona configuração CSS com PostCSS e Tailwind
    config.module.rules.push({
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              config: path.resolve(__dirname, '../postcss.config.mjs'),
            },
          },
        },
      ],
    });

    // Adiciona suporte para arquivos .js com JSX
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              [
                require.resolve('@babel/preset-react'),
                { runtime: 'automatic' },
              ],
            ],
          },
        },
      ],
      exclude: /node_modules/,
    });

    // Adiciona ProvidePlugin para disponibilizar React globalmente
    config.plugins.push(
      new webpack.ProvidePlugin({
        React: 'react',
      })
    );

    config.resolve.extensions.push('.js', '.jsx');

    return config;
  },
};
export default config;
