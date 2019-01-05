const merge = require('webpack-merge');
const prodConfig = require('./prod.config.js');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

module.exports = merge(prodConfig, {
  plugins: [
    new BundleAnalyzerPlugin({
      // analyzerMode: 'disabled',
      openAnalyzer: true,
      generateStatsFile: true
    })
  ]
});
