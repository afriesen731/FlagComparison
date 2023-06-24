const path = require('path');
const webpack = require('webpack');
const miniCssExtractPlugin = require('mini-css-extract-plugin')


module.exports = {
    mode: 'development', // production or development (maybe other)
    
    plugins: [
      new miniCssExtractPlugin({filename: 'css/[name].bundle.css'}), // css saved in css dir
      new webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery',})
    ],


    entry: {
      index: './src/js/index.js',
      rate: './src/js/rate.js',
      header: './src/js/header.js'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'js/dist')
    },
    
    watch: true, // checks index.js for changes
    // adds bootstrap to webpack
    module: {
        rules: [
          {
            test: /\.(scss)$/,
            use: [
                
              {
                // Extracts CSS for each JS file that includes CSS
                loader: miniCssExtractPlugin.loader
              },
              {
                loader: 'css-loader'
              },
              {
                loader: 'postcss-loader',
                options: {
                  postcssOptions: {
                    plugins: () => [
                      require('autoprefixer')
                    ]
                  }
                }
              },
              {
                loader: 'sass-loader'
              }
            ]
          }
        ]
    }
}   