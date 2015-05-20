var WebPack          = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config           = require('./build.config');
var path             = require('path');

/* Additional config for hot module replacement */
config.devtool = 'source-map';
config.entry.unshift('webpack-dev-server/client?http://localhost:3000', 'webpack/hot/only-dev-server');
config.plugins.push(new WebPack.HotModuleReplacementPlugin());
config.plugins.push(new WebPack.NoErrorsPlugin());
config.module.loaders[0].loaders.push('react-hot');
/* */

new WebpackDevServer(WebPack(config), {
  contentBase       : path.join(__dirname, 'dist/'),
  publicPath        : config.output.publicPath,
  hot               : true,
  historyApiFallback: true,
  stats             : {
    colors          : true,
    chunks          : false    
  }

}).listen(3000, 'localhost', function (err, result) {
  if (err) throw err;

  console.log('Listening at localhost:3000');
});
