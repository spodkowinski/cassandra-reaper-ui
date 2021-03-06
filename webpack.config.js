var path = require('path');
var webpack = require('webpack');


var _commonDeps = [
  "bootstrap.css", "sb-admin-2.css", "font-awesome.css", "metisMenu.css", "style.css",
  "jquery", "react", "bootstrap", "metisMenu", "sb-admin-2", "rxjs"
];

// include hot reload deps in dev mode
var isDev = process.env.BUILD_DEV == '1'; // set by server.js
if(isDev) {
  _commonDeps.push("webpack-dev-server/client?http://0.0.0.0:8080"); // WebpackDevServer host and port
  _commonDeps.push("webpack/hot/only-dev-server");
}

module.exports = {
  entry: {
    index: [
      path.join(__dirname, 'app', 'index.js')
    ],
    schedules: [
      path.join(__dirname, 'app', 'schedules.js')
    ],
    repair: [
      path.join(__dirname, 'app', 'repair.js')
    ],
    deps: _commonDeps
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js'
  },
  resolve: {
    root: [ path.join(__dirname, 'app'), path.join(__dirname, 'bower_components') ],
    alias: {
      "jquery": "jquery/dist/jquery",
      "bootstrap.css": "bootstrap/dist/css/bootstrap.min.css",
      "sb-admin-2.css": "startbootstrap-sb-admin-2/dist/css/sb-admin-2.css",
      "timeline.css": "startbootstrap-sb-admin-2/dist/css/timeline.css",
      "font-awesome.css": "font-awesome/css/font-awesome.min.css",
      "metisMenu.css": "metisMenu/dist/metisMenu.min.css",
      "sb-admin-2": "startbootstrap-sb-admin-2/dist/js/sb-admin-2.js",
      "rxjs": 'rxjs/dist/rx.all',
      "moment": 'moment/moment.js',
      "react/lib/ReactMount": "react-dom/lib/ReactMount"
    },
    extensions: ['', '.js', '.jsx']
  },
  devtool: "eval",
  resolveLoader: {
    root:  path.join(__dirname, "node_modules")
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "windows.jQuery": "jquery"
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"deps", /* filename= */"deps.js"),
    new webpack.DefinePlugin({
      'process.env': {
         NODE_ENV: JSON.stringify(isDev ? 'production' : 'dev')
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['react-hot', 'babel?modules=amd&optional=runtime'],
        include: path.join(__dirname, 'app')
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      // loaders for font-awesome
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
    ]
  }
};
