const path = require('path');
const webpack = require('webpack');
const libraryName = require('./package.json').name;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  const isProduction = (!!env && env.mode === 'production') || false;
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'none' : 'inline-source-map',
    entry: ['./src/index.ts'],
    output: {
      filename: libraryName + (isProduction ? '.min' : '') + '.js',
      path: path.resolve(__dirname, isProduction ? './dist/' : './tmp/'),
      library: undefined,
      libraryTarget: 'window'
    },
    devServer: {
      contentBase: './tmp',
      host: '0.0.0.0',
      port: 4200,
      historyApiFallback: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loaders: ['babel-loader', 'ts-loader'],
          exclude: /node_modules/
        }
      ]
    },
    plugins: isProduction ? [] : [new HtmlWebpackPlugin()]
  };
};
