const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/main.tsx',
  output: {
    path: path.join(__dirname, 'out'),
    filename: 'out.js'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {'@angular/core': '@angular/core/esm2015/core.js'}
  },
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: path.join(__dirname, 'out'),
    port: 5000,
    hot: true
  },
  optimization: {
    usedExports: true
  }
};
