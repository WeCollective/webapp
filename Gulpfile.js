// Import .env variables.
require('dotenv').config();

const { argv } = require('yargs');
const del = require('del');
const gulp = require('gulp');
const gutil = require('gulp-util');
const less = require('gulp-less');
const nodemon = require('gulp-nodemon');
const path = require('path');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const webpack = require('webpack');

const PUBLIC_DIR = path.join(__dirname, 'public');
const APP_DIR = path.join(PUBLIC_DIR, 'app');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const DEST_DIR = path.join(PUBLIC_DIR, 'dist');

const env = argv.env || 'development';
const local = env !== 'production' && !!argv.local;
const config = require('./config/gulp.config.json')[env];

if (!config) {
  console.warn(`Config for environment "${env}" not found!`);
  return;
}

const ensureSlash = str => str[str.length - 1] === '/' ? str : `${str}/`; // eslint-disable-line
const getBundleName = () => (env === 'production' ? 'bundle.min.js' : 'bundle.js');
const select = (...rest) => path.join(PUBLIC_DIR, ...rest);

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
    if (ext[0] !== '.') ext = `.${ext}`;
    string = string.substring(0, extIndex) + ext;
  }
  return string;
};

const processTemplate = (file, loaders) => {
  if (typeof file !== 'object') {
    file = {
      path: file,
    };
  }

  if (!loaders) loaders = [];

  let stream = gulp.src(select(file.path), { base: PUBLIC_DIR });

  for (let i = 0; i < loaders.length; i += 1) {
    stream = stream.pipe(replace(loaders[i].test, loaders[i].value));
  }

  stream.pipe(rename(setExtension(removeSubstring(file.path, '.template'), file.ext)))
    .pipe(gulp.dest(PUBLIC_DIR));

  return stream;
};

const WEBPACK_CONFIG = {
  entry: ['babel-polyfill', path.join(APP_DIR, 'app.js')],
  output: {
    filename: '',
    path: DEST_DIR,
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

gulp.task('build', ['cleanBuildDir', 'template-strings', 'less', 'webpack']);
gulp.task('cleanBuildDir', () => del([path.join(DEST_DIR, '/**/*')]));

gulp.task('less', () => gulp
  .src(path.join(ASSETS_DIR, 'styles/app.less'))
  .pipe(less())
  .pipe(rename('app.css'))
  .pipe(gulp.dest(DEST_DIR)));

gulp.task('nodemon', () => {
  if (!local) return;

  nodemon({
    quiet: true,
    script: 'server.js',
    verbose: false,
  });
});

gulp.task('template-strings', () => {
  processTemplate('index.template.html', [{
    test: /%SOCKET_IO_ENDPOINT%/g,
    value: local ?
      `http://localhost:${process.env.SERVER_PORT}/${process.env.WEBSOCKET_PATH}`
      : `${ensureSlash(config.api_url) + process.env.WEBSOCKET_PATH}`,
  }, {
    test: /%WECO_APP_SCRIPT%/g,
    value: getBundleName(),
  }]);

  processTemplate('app/env.config.template.js', [{
    test: /%ENV_NAME%/g,
    value: env,
  }, {
    test: /%ENV_ENDPOINT%/g,
    value: local ?
      `http://localhost:${process.env.SERVER_PORT}/${process.env.API_VERSION}`
      : `${ensureSlash(config.api_url) + process.env.API_VERSION}`,
  }]);
});

gulp.task('webpack', done => {
  WEBPACK_CONFIG.output.filename = getBundleName();

  webpack(WEBPACK_CONFIG, (err, stats) => { // eslint-disable-line no-unused-vars
    if (err) throw new gutil.PluginError('webpack', err);
    // gutil.log('[webpack]', stats.toString());
    done();
  });
});

gulp.task('default', ['build', 'nodemon'], () => {
  gulp.watch(select('**', '*.template.*'), ['template-strings']);

  gulp.watch([
    select('**', '*'),
    `!${select('dist', '**', '*')}`,
    `!${select('index.html')}`,
    `!${select('app', 'env.config.js')}`,
  ], ['build']);

  // Return the process in build as we wouldn't be able to execute multiple tasks otherwise.
  // Read more: https://github.com/gulpjs/gulp/issues/417.
  if (!local) {
    process.exit(0);
  }
});
