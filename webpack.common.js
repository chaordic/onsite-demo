const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: ['@babel/polyfill', './src/index.js'],

  output: {
    path: path.resolve('dist'),
    filename: '[name].js',
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),

    new CleanWebpackPlugin(['dist']),

    new HtmlWebpackPlugin({
      title: 'Onsite-demo',
      template: 'layout/index.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      },
      {
        test: /\.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
}
