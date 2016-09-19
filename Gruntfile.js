module.exports = function(grunt) {
  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-preprocess');

  // Configure tasks
  grunt.initConfig({
    // remove already-built files
    clean: {
      js: ['public/weco.js', 'public/weco.min.js']
    },
    // javascript linting
    jshint: {
      files: ['Gruntfile.js', 'server.js', 'public/**/*.js'],
      options: {
        node: true, // tell jshint we are using nodejs to avoid incorrect errors
        globals: {  // list of global variables and whether they are assignable
          "angular": false,
          "Promise": false,
          "alert": false
        }
      }
    },
    // file concatenation
    concat: {
      dist: {
        src: ['public/**/*.js'],
        dest: 'public/weco.js',
      }
    },
    // file minification
    uglify: {
      options: {
        // don't mangle names of important vars which can't be explicitly injected
        mangle: {
          except: ['angular', '$stateProvider', '$urlRouterProvider', '$locationProvider', '$injector', '$location', '$sceDelegateProvider']
        }
      },
      dist: {
        files: {
          'public/weco.min.js': ['public/weco.js']
        }
      }
    },
    // Compile Less to CSS
    less: {
      dist: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2,
          strictMath: true,
          strictUnits: true
        },
        files: {
          // destination file and source file
          "public/assets/styles/css/app.css": "public/assets/styles/less/app.less"
        }
      }
    },
    // File watching
    watch: {
      styles: {
        files: ['public/assets/styles/less/**/*.less'],
        tasks: ['less'],
        options: {
          spawn: false,
          maxListeners: 99
        }
      },
      js: {
        files: ['public/**/*.js'],
        tasks: ['js'],
        options: {
          spawn: false,
          maxListeners: 99
        }
      }
    },
    // Live reload server (for local development)
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    // concurrently run the server and watch for file changes
    concurrent: {
      serve: {
        options: {
          logConcurrentOutput: true
        },
        tasks: ['exec:serve', 'watch']
      }
    },
    // execute shell commands
    exec: {
      publish: 'git checkout production && git merge master && git checkout master',
      deploy: {
        cmd: function(environment) {
          var checkout;
          if(environment == 'development') {
            checkout = 'master';
          } else if(environment == 'production') {
            checkout = 'production';
          } else {
            return '';
          }
          return 'echo Checking out ' + checkout + ' && git checkout ' + checkout + ' && echo Deploying... && eb deploy && git checkout master';
        }
      },
      commit: 'git add -u && git commit -m "automatic build commit"',
      serve: 'node server.js'
    },
    // generate an 'config' angular module which defines the
    // development/production variables for use by the angular app
    ngconstant: {
      options: {
        space: ' ',
        wrap: '"use strict";\n\n {\%= __ngModule %}',
        name: 'config',
      },
      // development environment
      development: {
        options: {
          dest: 'public/app/config.js'
        },
        constants: {
          ENV: {
            name: 'development',
            apiEndpoint: 'http://api-dev.eu9ntpt33z.eu-west-1.elasticbeanstalk.com/'
          }
        }
      },
      production: {
        options: {
          dest: 'public/app/config.js'
        },
        constants: {
          ENV: {
            name: 'production',
            apiEndpoint: 'https://weco-api-prod.eu-west-1.elasticbeanstalk.com/'
          }
        }
      },
      local: {
        options: {
          dest: 'public/app/config.js'
        },
        constants: {
          ENV: {
            name: 'local',
            apiEndpoint: 'http://localhost:8080/'
          }
        }
      }
    },
    preprocess : {
      local: {
        files : {
          'public/index.html' : 'public/index.template.html',
          '.ebextensions/securelistener.config'   : '.ebextensions/securelistener.template.config.js'
        },
        options: {
          context: {
            ENV: 'local',
            SSL: 'false'
          }
        }
      },
      development: {
        files : {
          'public/index.html' : 'public/index.template.html',
          '.ebextensions/securelistener.config'   : '.ebextensions/securelistener.template.config.js'
        },
        options: {
          context: {
            ENV: 'development',
            SSL: 'false'
          }
        }
      },
      production: {
        files : {
          'public/index.html' : 'public/index.template.html',
          '.ebextensions/securelistener.config'   : '.ebextensions/securelistener.template.config.js'
        },
        options: {
          context: {
            ENV: 'production',
            SSL: 'true'
          }
        }
      }
    }
  });

  /* Register main tasks.
  **    grunt build:env       builds the current branch (cleans, lints, concats, minifies, compiles less),
  **                          configuring the app for the specified environment (i.e. using development/production/local api)
  **    grunt serve:env       build, then locally serve the web app and simultaneously watch for file changes, using the 'env' api
  **    grunt publish         builds for production and merges development branch into production
  **    grunt deploy:env      builds the current branch, and deploys to the specified environment
  **                          (either "development" or "production"), merging into production if needed.
  */
  grunt.registerTask('js', ['clean', 'jshint', 'concat', 'uglify']);
  grunt.registerTask('build:development', ['clean', 'ngconstant:development', 'preprocess:development', 'jshint', 'concat', 'uglify', 'less']);
  grunt.registerTask('build:production', ['clean', 'ngconstant:production', 'preprocess:production', 'jshint', 'concat', 'uglify', 'less']);
  grunt.registerTask('build:local', ['clean', 'ngconstant:local', 'preprocess:local', 'jshint', 'concat', 'uglify', 'less']);
  grunt.registerTask('serve:local', ['build:local', 'concurrent:serve']);
  grunt.registerTask('serve:development', ['build:development', 'concurrent:serve']);
  grunt.registerTask('publish', ['build:production', 'exec:commit', 'exec:publish']);
  grunt.registerTask('deploy:development', ['build:development', 'exec:commit', 'exec:deploy:development']);
  grunt.registerTask('deploy:production', ['publish', 'exec:deploy:production']);
};
