const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './sample_ivy/dist/sample_ivy/hello_world.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'out.js'
  },
  resolve: {
    alias: {'@angular/core': '@angular/core/esm2015/core.js'}
  },
  devtool: 'inline-source-map',
  plugins: [new HtmlWebpackPlugin(), new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: path.join(__dirname, 'out'),
    port: 5000,
    hot: true
  }
};
