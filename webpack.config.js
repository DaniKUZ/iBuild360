const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

// Load environment variables, preferring .env.local if it exists
(() => {
  const dotenv = require('dotenv');
  const envLocalPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envLocalPath)) {
    dotenv.config({ path: envLocalPath });
  } else {
    dotenv.config();
  }
})();

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
  mode: argv.mode || 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    chunkFilename: 'js/[name].[contenthash].chunk.js',
    assetModuleFilename: 'assets/[name].[contenthash][ext]',
    publicPath: '/',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_OPENAI_API_KEY': JSON.stringify(process.env.REACT_APP_OPENAI_API_KEY || ''),
      'process.env.REACT_APP_YANDEX_MAPS_API_KEY': JSON.stringify(process.env.REACT_APP_YANDEX_MAPS_API_KEY || ''),
      'process.env.VITE_YANDEX_MAPS_API_KEY': JSON.stringify(process.env.VITE_YANDEX_MAPS_API_KEY || ''),
      // Provide a compatible import.meta.env for code paths that check it
      'import.meta.env': JSON.stringify({
        VITE_YANDEX_MAPS_API_KEY: process.env.VITE_YANDEX_MAPS_API_KEY || process.env.REACT_APP_YANDEX_MAPS_API_KEY || '' ,
        REACT_APP_YANDEX_MAPS_API_KEY: process.env.REACT_APP_YANDEX_MAPS_API_KEY || ''
      }),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
          mangle: true,
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: 20,
      maxAsyncRequests: 20,
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 20,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
          priority: 5,
          enforce: true,
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
    usedExports: true,
    sideEffects: false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  };
}; 