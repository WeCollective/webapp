// Import .env variables.
require('dotenv').config();

const { argv } = require('yargs');
const gulp = require('gulp');
const less = require('gulp-less');
const nodemon = require('gulp-nodemon');
const path = require('path');
const PluginError = require('plugin-error');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const webpack = require('webpack');

const BUILD_DIR = path.join(__dirname, 'build');
const SRC_DIR = path.join(__dirname, 'src');

const APP_DIR = path.join(SRC_DIR, 'app');
const STATIC_DIR = path.join(BUILD_DIR, 'static');

const branchToEnvironment = branch => branch === 'master' ? 'production' : 'development'; // eslint-disable-line no-confusing-arrow

const branch = process.env.TRAVIS_BRANCH || argv.branch || 'develop';
const env = argv.env || branchToEnvironment(branch);
const local = env !== 'production' && !!argv.local;
const config = require('./config/gulp.config.json')[env];

if (!config) {
  console.warn(`Config for environment "${env}" not found!`);
  return;
}

console.log(`🚀 Setting up ${env} environment on ${local ? 'local' : `branch ${branch}`}...\n`);

const ensureSlash = str => str.endsWith('/') ? str : `${str}/`; // eslint-disable-line no-confusing-arrow
const getBundleName = () => env === 'production' ? 'bundle.min.js' : 'bundle.js'; // eslint-disable-line no-confusing-arrow
const select = (...rest) => path.join(SRC_DIR, ...rest);

const removeSubstring = (string, needle) => {
  if (needle) {
    const needleIndex = string.indexOf(needle);
    string = string.substring(0, needleIndex) + string.substring(needleIndex + needle.length);
  }
  return string;
};

const setExtension = (string, ext) => {
  if (ext) {
    const extIndex = string.lastIndexOf('.');
    if (!ext.startsWith('.')) ext = `.${ext}`;
    string = string.substring(0, extIndex) + ext;
  }
  return string;
};

const processTemplate = (options = {}) => {
  let { file, loaders, output } = options;

  if (typeof file !== 'object') {
    file = {
      path: file,
    };
  }

  if (!loaders) loaders = [];
  if (!output) output = SRC_DIR;

  let stream = gulp.src(select(file.path), { base: SRC_DIR });

  for (let i = 0; i < loaders.length; i += 1) {
    stream = stream.pipe(replace(loaders[i].test, loaders[i].value));
  }

  stream.pipe(rename(setExtension(removeSubstring(file.path, '.template'), file.ext)))
    .pipe(gulp.dest(output));

  return stream;
};

const WEBPACK_CONFIG = {
  entry: ['babel-polyfill', path.join(APP_DIR, 'app.js')],
  output: {
    filename: '',
    path: STATIC_DIR,
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.js'],
    modules: [
      path.resolve(APP_DIR),
      path.resolve('./node_modules'),
    ],
  },
  module: {
    loaders: [{
      test: /\.js$/,
      include: APP_DIR,
      query: {
        presets: ['es2015', 'stage-0'],
      },
      loader: 'babel-loader',
    }],
  },
  plugins: env === 'production' ? [
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      compress: {
        warnings: false,
        drop_console: true,
      },
    }),
  ] : [],
};

gulp.task('assets', () => gulp.src(select('assets', '**', '*'))
  .pipe(gulp.dest(path.join(BUILD_DIR, 'assets'))));

gulp.task('app', () => gulp.src(select('app', '**', '*'))
  .pipe(gulp.dest(path.join(BUILD_DIR, 'app'))));

gulp.task('template-strings', done => {
  processTemplate({
    file: 'index.template.html',
    output: BUILD_DIR,
    loaders: [{
      test: /%SOCKET_IO_ENDPOINT%/g,
      value: local ?
        `https://localhost:${process.env.SERVER_PORT}/${process.env.WEBSOCKET_PATH}`
        : `${ensureSlash(config.api_url) + process.env.WEBSOCKET_PATH}`,
    }, {
      test: /%WECO_APP_SCRIPT%/g,
      value: getBundleName(),
    }],
  });

  processTemplate({
    file: 'app/env.config.template.js',
    loaders: [{
      test: /%ENV_NAME%/g,
      value: env,
    }, {
      test: /%ENV_ENDPOINT%/g,
      value: local ?
        `https://localhost:${process.env.SERVER_PORT}/${process.env.API_VERSION}`
        : `${ensureSlash(config.api_url) + process.env.API_VERSION}`,
    }],
  });

  done();
});

gulp.task('webpack', done => {
  WEBPACK_CONFIG.output.filename = getBundleName();

  webpack(WEBPACK_CONFIG, err => {
    if (err) {
      throw new PluginError({
        plugin: 'webpack',
        message: err,
      });
    }
    done();
  });
});

gulp.task('build', gulp.series('template-strings', 'assets', 'app', 'webpack'));

gulp.task('compile-less', () => gulp.src(select('assets', 'styles', 'app.less'))
  .pipe(less())
  .pipe(rename('app.css'))
  .pipe(gulp.dest(STATIC_DIR)));

gulp.task('compile-sass', () => gulp.src(select('assets', 'styles', 'app.scss'))
  .pipe(plumber())
  .pipe(sass())
  .pipe(rename('app-sass.css'))
  .pipe(gulp.dest(STATIC_DIR)));

gulp.task('nodemon', done => {
  if (local) {
    nodemon({
      env: {
        NODE_ENV: local ? 'local' : env,
      },
      quiet: true,
      script: 'server.js',
      verbose: false,
    });
  }
  done();
});

gulp.task('watch', done => {
  if (local) {
    gulp.watch([
      select('**', '*'),
      `!${select('build', '**', '*')}`,
      `!${select('assets', 'styles', '**', '*')}`,
      `!${select('index.html')}`,
      `!${select('app', 'env.config.js')}`,
    ], gulp.series('build'));

    gulp.watch(select('**', '*.less'), gulp.series('compile-less'));
    gulp.watch(select('**', '*.scss'), gulp.series('compile-sass'));
    gulp.watch(select('**', '*.template.*'), gulp.series('template-strings'));
  }

  done();
});

gulp.task('default', gulp.series('build', 'compile-less', 'compile-sass', 'nodemon', 'watch'));
