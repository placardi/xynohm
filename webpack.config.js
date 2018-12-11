const path = require('path');
const library = require('./package.json').name;

module.exports = env => {
  const isDevelopment = env.mode === 'development' || false;
  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'source-map' : 'none',
    entry: './src/index.ts',
    output: {
      filename: library + (isDevelopment ? '' : '.min') + '.js',
      path: path.resolve(__dirname, 'dist'),
      library: library,
      libraryTarget: 'umd',
      umdNamedDefine: true
    },
    devServer: {
      contentBase: './dist'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'eslint-loader'
        }
      ]
    }
  };
};
