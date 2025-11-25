const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    liveReload: true,
    hot: true,
    open: ['/src/pages/index.html'],
    static: [
      {
        directory: './',
        publicPath: '/',
      },
      {
        directory: './src',
        publicPath: '/',
      }
    ],
  },
});
