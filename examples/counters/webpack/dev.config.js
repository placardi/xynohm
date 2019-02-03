const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

const getDirectoriesRecursive = dir => [
  dir,
  ...fs
    .readdirSync(dir)
    .map(file => path.join(dir, file))
    .filter(p => fs.statSync(p).isDirectory())
    .map(getDirectoriesRecursive)
    .reduce((a, b) => a.concat(b), [])
];

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: '[name].js'
  },
  devServer: {
    contentBase: [path.resolve(__dirname, '../src')].concat(
      getDirectoriesRecursive(path.resolve(__dirname, '../src/components')),
      getDirectoriesRecursive(path.resolve(__dirname, '../src/modules'))
    ),
    watchContentBase: true,
    host: '0.0.0.0',
    port: 4200,
    historyApiFallback: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['source-map-loader'],
        enforce: 'pre'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              import: true
            }
          }
        ],
        include: /src/
      }
    ]
  },
  plugins: [
    new ErrorOverlayPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    })
  ]
});
