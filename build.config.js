var path               = require('path');
var WebPack            = require('webpack');
var HtmlWebpackPlugin  = require('html-webpack-plugin');

module.exports      = {
  entry             : [ './src/index' ],
  output            : {
    path            : path.join(__dirname, 'dist'),
    filename        : 'bundle.js',
    publicPath      : '/'
  },
  plugins           : [ new HtmlWebpackPlugin({
    title           : ' ',
    template        : path.join(__dirname, 'src/index.html')
  }) ],
  resolve           : {
    extensions      : ['', '.js', '.jsx', 'sass', 'scss'],
    alias           : {
      'root'        : path.join(__dirname, 'src/'),
      'components'  : path.join(__dirname, 'src/components'),
      'stores'      : path.join(__dirname, 'src/stores'),
      'styles'      : path.join(__dirname, 'src/styles')
    }
  },
  module            : {
    loaders         : [
      {
        test        : /\.jsx?$/,
        loaders     : ['jsx-loader'],
        include     : path.join(__dirname, 'src'),
        exclude     : /node_modules/
      },
      {
        test: /\.sass$/,
        loader: "style!css!sass?indentedSyntax"
      },
      {
        test: /\.scss$/,
        loader: "style!css!sass"
      }
    ],
    postLoaders     : [
      {
        test          : /\.jsx?$/,
        loader        : "transform?envify"  
      }
    ]
  },
  transforms        :[

  ]
};
