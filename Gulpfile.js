var gulp = require('gulp');
var argv = require('yargs').argv;
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var del = require('del');
var replace = require('gulp-replace');
var rename = require("gulp-rename");

var environment = process.env.NODE_ENV || 'development';
var APP_DIR = path.join(__dirname, 'public/app');
var ASSETS_DIR = path.join(__dirname, 'public/assets');
var DEST_DIR = path.join(__dirname, 'public/dist');

gulp.task('webpack', function(done) {
  webpack({
    entry: path.join(APP_DIR, 'app.js'),
    output: {
      filename: environment === 'production' ? 'bundle.min.js' : 'bundle.js',
      path: DEST_DIR
    },
    devtool: 'source-map',
    resolve: {
      extensions: ['.js']
    },
    module : {
      loaders : [{
        test : /\.js$/,
        include : APP_DIR,
        loader : 'babel-loader'
      }]
    },
    plugins: environment === 'production' ? [
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false }
      })
    ] : []
  }, function(err, stats) {
      if(err) throw new gutil.PluginError('webpack', err);
      gutil.log('[webpack]', stats.toString());
      done();
  });
});

gulp.task('lint', function() {
  return gulp.src([path.join(APP_DIR, '**/*.js'), path.join('!', APP_DIR, '**/*.template.js')])
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
  return del([path.join(DEST_DIR, '/**/*')]);
});

gulp.task('template', function(done) {
  runSequence('template:config', 'template:index', done);
});

gulp.task('template:config', function() {
  var apiEndpoint;
  if(environment === 'local') apiEndpoint = 'http://localhost:8080/v1/';
  if(environment === 'development') apiEndpoint = 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/v1/';
  if(environment === 'production') apiEndpoint = 'https://wecoapi.com/v1/';

  return gulp.src([path.join(APP_DIR, 'env.config.template.js')])
    .pipe(replace(/%ENV_NAME%/g, environment))
    .pipe(replace(/%ENV_ENDPOINT%/g, apiEndpoint))
    .pipe(rename('env.config.js'))
    .pipe(gulp.dest(APP_DIR));
});

gulp.task('template:index', function() {
  var socketIOEndpoint;
  if(environment === 'local') socketIOEndpoint = 'http://localhost:8080/socket.io/socket.io.js';
  if(environment === 'development') socketIOEndpoint = 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/socket.io/socket.io.js';
  if(environment === 'production') socketIOEndpoint = 'https://wecoapi.com/socket.io/socket.io.js';

  return gulp.src([path.join(__dirname, 'public/index.template.html')])
    .pipe(replace(/%SOCKET_IO_ENDPOINT%/g, socketIOEndpoint))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(path.join(__dirname, 'public')));
});

gulp.task('less', function () {
  return gulp.src(path.join(ASSETS_DIR, 'styles/app.less'))
    .pipe(less())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('build', function(done) {
  if(argv.production) { environment = 'production'; }
  if(argv.development) { environment = 'development'; }
  if(argv.local) { environment = 'local'; }

  runSequence('clean', 'template:config', 'less', 'lint', 'template:config', 'webpack', done);
});
