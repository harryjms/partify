import path from 'path';
import nodeExternals from 'webpack-node-externals';
import webpackShell from 'webpack-shell-plugin';
import dotenv from 'dotenv-webpack';

module.exports = {
  target: 'node',
  externals: [nodeExternals()],
  entry: './src/server.ts',
  output: { path: path.resolve(__dirname, './build'), filename: 'server.js' },
  module: {
    rules: [
      {
        test: /.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /.json$/,
        loader: 'file-loader',
      },
      {
        test: /.js$/,
        loader: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  ...(process.env !== 'production' && {
    plugins: [
      new dotenv(),
      new webpackShell({
        onBuildEnd: ['nodemon build/server.js --watch build'],
      }),
    ],
  }),
};
