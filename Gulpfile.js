const gulp = require('gulp');
const yargs = require('yargs');
const clean = require('gulp-clean');
const del = require('del');
const fs = require('fs');
const gutil = require('gulp-util');
const jshint = require('gulp-jshint');
const less = require('gulp-less');
const logger = require('./console-logger');
const nodemon = require("gulp-nodemon");
const path = require('path');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const webpack = require('webpack');

const DEFAULT_ENV = 'development';
let environment = process.env.NODE_ENV || DEFAULT_ENV;

const PUBLIC_DIR = path.join(__dirname, 'public');
const APP_DIR = path.join(PUBLIC_DIR, 'app');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const DEST_DIR = path.join(PUBLIC_DIR, 'dist');

const GULP_ENV_CONFIG_FILE_DIR = './'
const GULP_ENV_CONFIG_FILE_PATH = `${GULP_ENV_CONFIG_FILE_DIR}.gulp-env`;
// This is so we preserve environment setting on Nodemon refresh.
let _firstRun = false;

function fileFromString (opts = {}) {
  opts.name = opts.name || 'unnamed-file-from-gulp';
  opts.body = opts.body || 'Set file body in the gulpfile.js';

  let src = require('stream').Readable({ objectMode: true });
  src._read = function () {
    this.push(new gutil.File({
      base: '',
      contents: new Buffer(opts.body),
      cwd: '',
      path: opts.name,
    }));
    this.push(null);
  }
  return src;
}

function setInitialTask (env) {
  _firstRun = true;
  
  if (env) {
    environment = env;
  }
}

const WEBPACK_CONFIG = {
  entry: path.join(APP_DIR, 'app.js'),
  output: {
    filename: '',
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
  runSequence('cleanBuildDir', 'replaceTemplateStrings:config', 'less', 'lint', 'webpack', 'replaceTemplateStrings:index', done);
});

gulp.task('build:dev', done => {
  setInitialTask('development');
  runSequence('configEnvironment', 'cleanBuildDir', 'replaceTemplateStrings:config', 'less', 'lint', 'webpack', 'replaceTemplateStrings:index', done);
});

gulp.task('build:production', done => {
  setInitialTask('production');
  runSequence('configEnvironment', 'cleanBuildDir', 'replaceTemplateStrings:config', 'less', 'lint', 'webpack', 'replaceTemplateStrings:index', done);
});

gulp.task('cleanBuildDir', () => {
  return del([path.join(DEST_DIR, '/**/*')]);
});

gulp.task('configEnvironment', () => {
  // Delete the old config file.
  if (_firstRun) {
    gulp.src(GULP_ENV_CONFIG_FILE_PATH, { read: false }).pipe(clean());
  }

  fs.readFile(GULP_ENV_CONFIG_FILE_PATH, 'utf-8', (err, file_body) => {
    const cliEnv = err || _firstRun ? (yargs.argv.env || environment) : file_body;

    if (cliEnv === 'production') {
      environment = 'production';
    }
    else if (cliEnv === 'dev') {
      environment = 'development';
    }
    else if (cliEnv === 'local') {
      environment = 'local';
    }
    else if (cliEnv === 'test') {
      environment = 'test';
    }
    
    if (cliEnv) {
      logger.log(`Environment set to ${environment}.`, '1F4DD');
      fileFromString({ name: GULP_ENV_CONFIG_FILE_PATH, body: cliEnv }).pipe(gulp.dest(GULP_ENV_CONFIG_FILE_DIR))
    }
    else {
      logger.log(`Environment defaults to ${environment}.`, '1F4DD');
    }
  })
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
      browser: true,
      devel: true,
      esversion: 6,
      strict: 'implied',
      loopfunc: true,
      // Allow fall-through in switch statements.
      '-W086': true,
      // This was throwing an error in the case of _ => 'hey from an arrow function'. :/
      unused: false
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('nodemon', () => {
  nodemon({
    ext: 'js html less',
    ignore: [
      'public/app/env.config.js',
      'public/dist/*',
      'public/index.html'
    ],
    quiet: true,
    script: 'server.js',
    tasks: ['configEnvironment', 'build'],
    verbose: false,
    watch: 'public'
  });
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
  else if (environment === 'test') {
    apiEndpoint = 'https://api-prod-test.eu-west-1.elasticbeanstalk.com/v1';
  }

  logger.log(`Using ${apiEndpoint} as the endpoint...`, '1F4CD');

  return gulp.src([path.join(APP_DIR, 'env.config.template.js')])
    .pipe(replace(/%ENV_NAME%/g, environment))
    .pipe(replace(/%ENV_ENDPOINT%/g, apiEndpoint))
    .pipe(rename('env.config.js'))
    .pipe(gulp.dest(APP_DIR));
});

gulp.task('replaceTemplateStrings:index', () => {
  const wecoAppScript = 'production' === environment ? 'bundle.min.js' : 'bundle.js';
  let socketIOEndpoint;

  if (environment === 'local') {
    socketIOEndpoint = 'http://localhost:8080/socket.io/socket.io.js';
  }
  else if (environment === 'development') {
    socketIOEndpoint = 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/socket.io/socket.io.js';
  }
  else if (environment === 'production') {
    socketIOEndpoint = 'https://wecoapi.com/socket.io/socket.io.js';
  }
  else if (environment === 'test') {
    socketIOEndpoint = 'https://api-prod-test.eu-west-1.elasticbeanstalk.com/socket.io/socket.io.js';
  }

  return gulp.src([path.join(PUBLIC_DIR, 'index.template.html')])
    .pipe(replace(/%SOCKET_IO_ENDPOINT%/g, socketIOEndpoint))
    .pipe(replace(/%WECO_APP_SCRIPT%/g, wecoAppScript))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(PUBLIC_DIR));
});

gulp.task('webpack', done => {
  WEBPACK_CONFIG.output.filename = environment === 'production' ? 'bundle.min.js' : 'bundle.js';

  webpack(WEBPACK_CONFIG, (err, stats) => {
      if (err) throw new gutil.PluginError('webpack', err);
      //gutil.log('[webpack]', stats.toString());
      done();
  });
});

gulp.task('default', done => {
  setInitialTask();
  runSequence('configEnvironment', 'build', 'nodemon', done);
});
