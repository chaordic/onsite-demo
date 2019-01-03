const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',

  devServer: {
    host: '0.0.0.0',
    port: 9000
  },

  module: {
    rules: [
      {
        test: /\.ejs$/,
        use: [{
          loader: 'html-loader',
        }],
      },
    ]
  }
});
