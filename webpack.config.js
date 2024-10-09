const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { minify } = require('html-minifier-terser');


dotenv.config();

module.exports = {
  entry: './src/index.js',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  output: {
    filename: 'js/[name].[contenthash].js',
    path: path.resolve(__dirname, 'www'),
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'www')
    },
    hot: true,
    watchFiles: ['./src/**/*'],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        SUPABASE_URL: JSON.stringify(process.env.SUPABASE_URL),
        SUPABASE_KEY: JSON.stringify(process.env.SUPABASE_KEY),
        FIREBASE_API_KEY: JSON.stringify(process.env.FIREBASE_API_KEY),
        FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN),
        FIREBASE_DATABASE_URL: JSON.stringify(process.env.FIREBASE_DATABASE_URL),
        FIREBASE_PROJECT_ID: JSON.stringify(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET),
        FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID),
        FIREBASE_APP_ID: JSON.stringify(process.env.FIREBASE_APP_ID),
        FIREBASE_MEASUREMENT_ID: JSON.stringify(process.env.FIREBASE_MEASUREMENT_ID),
        REWARDED_AD_ID: JSON.stringify(process.env.REWARDED_AD_ID),
        INTERSTITIAL_AD_ID: JSON.stringify(process.env.INTERSTITIAL_AD_ID),
        BANNER_AD_ID: JSON.stringify(process.env.BANNER_AD_ID),
        REWARDED_INTERSTITIAL_AD_ID: JSON.stringify(process.env.REWARDED_INTERSTITIAL_AD_ID)
      }
    }),
    new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      // Custom function to inject cordova.js after Webpack scripts
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/pages',
          to: 'pages',
          transform(content, path) {
            if (process.env.NODE_ENV === 'production' && path.endsWith('.html')) {
              return minify(content.toString(), {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyJS: true,
                minifyCSS: true
              });
            }
            return content;
          },
        },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.worker\.js$/,   // Look for files ending with `.worker.js`
        use: { loader: 'worker-loader' },  // Use worker-loader to handle worker files
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [
          "style-loader",
          "css-loader",
          "less-loader",
        ],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4,
              },
            },
          },
        ],
      },
      {
        test: /\.f7.html$/,
        use: [
          'framework7-loader',
        ],
      },
    ],
  },
};
