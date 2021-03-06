const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  devServer: {
    contentBase: './dist',
    host: '0.0.0.0',
    port: 4200,
    historyApiFallback: true
  },
  plugins: [new ErrorOverlayPlugin(), new HtmlWebpackPlugin()]
});
