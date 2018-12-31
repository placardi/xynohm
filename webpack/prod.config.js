const merge = require('webpack-merge');
const baseConfig = require('./base.config.js');

module.exports = merge(baseConfig, {
  mode: 'production',
  devtool: 'none',
  devServer: {
    contentBase: './tmp',
    host: '0.0.0.0',
    port: 4200,
    historyApiFallback: true
  }
});
