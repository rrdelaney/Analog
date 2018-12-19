const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true,
        extractComments: true
      })
    ]
  }
};
