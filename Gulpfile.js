const gulp = require('gulp');
const argv = require('yargs').argv;
const del  = require('del');
const gutil   = require('gulp-util');
const jshint  = require('gulp-jshint');
const less    = require('gulp-less');
const nodemon = require("gulp-nodemon");
const path    = require('path');
const rename  = require('gulp-rename');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const webpack = require('webpack');

const DEFAULT_ENV = 'development';
const environment = process.env.NODE_ENV || DEFAULT_ENV;

const PUBLIC_DIR = path.join(__dirname, 'public');
const APP_DIR    = path.join(PUBLIC_DIR, 'app');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const DEST_DIR   = path.join(PUBLIC_DIR, 'dist');

const WEBPACK_CONFIG = {
  entry: path.join(APP_DIR, 'app.js'),
  output: {
    filename: 'production' === environment ? 'bundle.min.js' : 'bundle.js',
    path: DEST_DIR
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve(APP_DIR),
      path.resolve('./node_modules')
    ]
  },
  module : {
    loaders : [{
      test : /\.js$/,
      include : APP_DIR,
      /*
      query: {
        presets: ['es2015']
      },
      */
      loader : 'babel-loader'
    }]
  },
  plugins: 'production' === environment ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ] : []
};

gulp.task('build', done => {
  if (argv.production) {
    environment = 'production';
  }
  else if (argv.development) {
    environment = 'development';
  }
  else if (argv.local) {
    environment = 'local';
  }
  console.log(`Environment set to ${environment}...`);
  runSequence('cleanBuildDir', 'replaceTemplateStrings', 'less', 'lint', 'webpack', done);
});

gulp.task('cleanBuildDir', () => {
  return del([path.join(DEST_DIR, '/**/*')]);
});

gulp.task('less', () => {
  return gulp.src(path.join(ASSETS_DIR, 'styles/app.less'))
    .pipe(less())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(DEST_DIR));
});

gulp.task('lint', () => {
  return gulp.src([path.join(APP_DIR, '**/*.js'), path.join('!', APP_DIR, '**/*.template.js')])
    .pipe(jshint({
      esversion: 6,
      strict: 'implied'
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', () => {
  nodemon({
    ext: 'js html less',
    watch: 'public',
    ignore: [
      'public/app/env.config.js',
      'public/dist/*',
      'public/index.html'
    ],
    script: 'server.js',
    verbose: true,
    delay: 500,
    tasks: ['build']
  });
});

gulp.task('replaceTemplateStrings', done => {
  runSequence('replaceTemplateStrings:config', 'replaceTemplateStrings:index', done);
});

gulp.task('replaceTemplateStrings:config', () => {
  let apiEndpoint;
  
  if (environment === 'local') {
    apiEndpoint = 'http://localhost:8080/v1';
  }
  else if (environment === 'development') {
    apiEndpoint = 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/v1';
  }
  else if (environment === 'production') {
    apiEndpoint = 'https://wecoapi.com/v1';
  }

  return gulp.src([path.join(APP_DIR, 'env.config.template.js')])
    .pipe(replace(/%ENV_NAME%/g, environment))
    .pipe(replace(/%ENV_ENDPOINT%/g, apiEndpoint))
    .pipe(rename('env.config.js'))
    .pipe(gulp.dest(APP_DIR));
});

gulp.task('replaceTemplateStrings:index', () => {
  let wecoAppScript = 'bundle.js',
    socketIOEndpoint;

  if (environment === 'local') {
    socketIOEndpoint = 'http://localhost:8080/socket.io/socket.io.js';
  }
  else if (environment === 'development') {
    socketIOEndpoint = 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/socket.io/socket.io.js';
  }
  else if (environment === 'production') {
    socketIOEndpoint = 'https://wecoapi.com/socket.io/socket.io.js';
    wecoAppScript = 'bundle.min.js';
  }

  return gulp.src([path.join(PUBLIC_DIR, 'index.template.html')])
    .pipe(replace(/%SOCKET_IO_ENDPOINT%/g, socketIOEndpoint))
    .pipe(replace(/%WECO_APP_SCRIPT%/g, wecoAppScript))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(PUBLIC_DIR));
});

gulp.task('webpack', done => {
  WEBPACK_CONFIG.output.filename = 'production' === environment ? 'bundle.min.js' : 'bundle.js';
  webpack(WEBPACK_CONFIG, (err, stats) => {
      if (err) throw new gutil.PluginError('webpack', err);
      gutil.log('[webpack]', stats.toString());
      done();
  });
});

gulp.task('default', done => {
  runSequence('build', 'nodemon', done);
});