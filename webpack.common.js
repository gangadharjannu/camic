const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'favicon.png',
          to: '.',
        },
        {
          from: 'manifest.json',
          to: '.',
        },
        {
          from: 'install.js',
          to: '.',
        },
        {
          from: 'service-worker.js',
          to: '.',
        },
        {
          from: 'assets',
          to: 'assets',
        },
      ],
    }),
    new HtmlWebpackPlugin({
      title: 'Custom template',
      // Loads custom template
      template: 'index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};
